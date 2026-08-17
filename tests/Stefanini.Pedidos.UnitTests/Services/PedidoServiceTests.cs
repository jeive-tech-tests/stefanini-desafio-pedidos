using NSubstitute;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Application.Models.Pedidos;
using Stefanini.Pedidos.Application.Services;
using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.UnitTests.Builders;

namespace Stefanini.Pedidos.UnitTests.Services;

public sealed class PedidoServiceTests
{
    private readonly IPedidoRepository _pedidoRepository = Substitute.For<IPedidoRepository>();
    private readonly IProdutoRepository _produtoRepository = Substitute.For<IProdutoRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();

    [Fact]
    public async Task ObterPorId_QuandoPedidoExiste_DeveRetornarModeloExigido()
    {
        Pedido pedido = PedidoBuilder.CriarPedido();
        _pedidoRepository
            .ObterPorIdAsync(42, false, Arg.Any<CancellationToken>())
            .Returns(pedido);

        PedidoService service = CriarService();

        PedidoResponse resposta = await service.ObterPorIdAsync(42, CancellationToken.None);

        Assert.Equal(42, resposta.Id);
        Assert.Equal("Cliente Teste", resposta.NomeCliente);
        Assert.Equal("cliente@teste.com", resposta.EmailCliente);
        Assert.False(resposta.Pago);
        Assert.Equal(51.00m, resposta.ValorTotal);

        ItemPedidoResponse item = Assert.Single(resposta.ItensPedido);
        Assert.Equal(10, item.Id);
        Assert.Equal(7, item.IdProduto);
        Assert.Equal("Produto teste", item.NomeProduto);
        Assert.Equal(25.50m, item.ValorUnitario);
        Assert.Equal(2, item.Quantidade);

        await _pedidoRepository.Received(1).ObterPorIdAsync(
            42,
            false,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ObterPorId_QuandoPedidoNaoExiste_DeveLancarNotFoundException()
    {
        _pedidoRepository
            .ObterPorIdAsync(404, false, Arg.Any<CancellationToken>())
            .Returns((Pedido?)null);

        PedidoService service = CriarService();

        NotFoundException excecao = await Assert.ThrowsAsync<NotFoundException>(
            () => service.ObterPorIdAsync(404, CancellationToken.None));

        Assert.Contains("404", excecao.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Criar_QuandoPayloadValido_DevePersistirPedidoComPrecoAtualDoProduto()
    {
        Produto produto = PedidoBuilder.CriarProduto(7, "Produto teste", 25.50m);
        _produtoRepository
            .ObterPorIdsAsync(Arg.Any<IReadOnlyCollection<int>>(), Arg.Any<CancellationToken>())
            .Returns([produto]);

        Pedido? pedidoCapturado = null;
        _pedidoRepository
            .AdicionarAsync(Arg.Any<Pedido>(), Arg.Any<CancellationToken>())
            .Returns(chamada =>
            {
                pedidoCapturado = chamada.Arg<Pedido>();
                return Task.CompletedTask;
            });

        _unitOfWork
            .SaveChangesAsync(Arg.Any<CancellationToken>())
            .Returns(_ =>
            {
                PedidoBuilder.DefinirId(pedidoCapturado!, 99);
                return 1;
            });

        _pedidoRepository
            .ObterPorIdAsync(99, false, Arg.Any<CancellationToken>())
            .Returns(_ => pedidoCapturado);

        var request = new CriarPedidoRequest
        {
            NomeCliente = "Cliente Teste",
            EmailCliente = "CLIENTE@TESTE.COM",
            Pago = true,
            ItensPedido = [new ItemPedidoRequest { IdProduto = 7, Quantidade = 3 }]
        };

        PedidoService service = CriarService();

        PedidoResponse resposta = await service.CriarAsync(request, CancellationToken.None);

        Assert.NotNull(pedidoCapturado);
        Assert.Equal(99, resposta.Id);
        Assert.Equal("cliente@teste.com", resposta.EmailCliente);
        Assert.True(resposta.Pago);
        Assert.Equal(76.50m, resposta.ValorTotal);
        Assert.Equal(25.50m, Assert.Single(resposta.ItensPedido).ValorUnitario);

        await _pedidoRepository.Received(1).AdicionarAsync(
            Arg.Any<Pedido>(),
            Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Criar_QuandoProdutoNaoExiste_DeveLancarNotFoundSemPersistir()
    {
        _produtoRepository
            .ObterPorIdsAsync(Arg.Any<IReadOnlyCollection<int>>(), Arg.Any<CancellationToken>())
            .Returns([]);

        var request = new CriarPedidoRequest
        {
            NomeCliente = "Cliente Teste",
            EmailCliente = "cliente@teste.com",
            ItensPedido = [new ItemPedidoRequest { IdProduto = 999, Quantidade = 1 }]
        };

        PedidoService service = CriarService();

        NotFoundException excecao = await Assert.ThrowsAsync<NotFoundException>(
            () => service.CriarAsync(request, CancellationToken.None));

        Assert.Contains("999", excecao.Message, StringComparison.Ordinal);
        await _pedidoRepository.DidNotReceive().AdicionarAsync(
            Arg.Any<Pedido>(),
            Arg.Any<CancellationToken>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    private PedidoService CriarService()
    {
        return new PedidoService(_pedidoRepository, _produtoRepository, _unitOfWork);
    }
}
