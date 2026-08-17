using NSubstitute;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Application.Models.Common;
using Stefanini.Pedidos.Application.Models.Pedidos;
using Stefanini.Pedidos.Application.Services;
using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.Domain.Exceptions;
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

    [Fact]
    public async Task Listar_DeveAplicarFiltrosECalcularTotalDePaginas()
    {
        var query = new PedidosQuery
        {
            Pagina = 2,
            TamanhoPagina = 2,
            NomeCliente = "  Cliente  ",
            Pago = false
        };
        Pedido pedido = PedidoBuilder.CriarPedido();
        _pedidoRepository
            .ListarAsync(2, 2, "Cliente", false, Arg.Any<CancellationToken>())
            .Returns(([pedido], 5));
        PedidoService service = CriarService();

        ResultadoPaginado<PedidoResponse> resultado = await service.ListarAsync(query);

        Assert.Equal(2, resultado.Pagina);
        Assert.Equal(2, resultado.TamanhoPagina);
        Assert.Equal(5, resultado.TotalItens);
        Assert.Equal(3, resultado.TotalPaginas);
        Assert.Equal(42, Assert.Single(resultado.Itens).Id);
    }

    [Fact]
    public async Task ObterSumario_DeveRetornarAgregadosGlobaisDoRepositorio()
    {
        var esperado = new SumarioPedidosResponse(50, 123_456.78m, 32, 18);
        _pedidoRepository
            .ObterSumarioAsync(Arg.Any<CancellationToken>())
            .Returns(esperado);
        PedidoService service = CriarService();

        SumarioPedidosResponse resultado = await service.ObterSumarioAsync(
            CancellationToken.None);

        Assert.Same(esperado, resultado);
        await _pedidoRepository.Received(1).ObterSumarioAsync(
            Arg.Any<CancellationToken>());
        await _pedidoRepository.DidNotReceive().ListarAsync(
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<string?>(),
            Arg.Any<bool?>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Atualizar_QuandoPedidoExiste_DeveSubstituirDadosEItens()
    {
        Pedido pedido = PedidoBuilder.CriarPedido();
        Produto monitor = PedidoBuilder.CriarProduto(2, "Monitor", 1_199.90m);
        _pedidoRepository
            .ObterPorIdAsync(42, true, Arg.Any<CancellationToken>())
            .Returns(pedido);
        _produtoRepository
            .ObterPorIdsAsync(Arg.Any<IReadOnlyCollection<int>>(), Arg.Any<CancellationToken>())
            .Returns([monitor]);
        _pedidoRepository
            .ObterPorIdAsync(42, false, Arg.Any<CancellationToken>())
            .Returns(pedido);
        var request = new AtualizarPedidoRequest
        {
            NomeCliente = "Cliente Atualizado",
            EmailCliente = "ATUALIZADO@EXAMPLE.COM",
            Pago = true,
            ItensPedido = [new ItemPedidoRequest { IdProduto = 2, Quantidade = 3 }]
        };
        PedidoService service = CriarService();

        PedidoResponse resposta = await service.AtualizarAsync(42, request);

        Assert.Equal("Cliente Atualizado", resposta.NomeCliente);
        Assert.Equal("atualizado@example.com", resposta.EmailCliente);
        Assert.True(resposta.Pago);
        Assert.Equal(3_599.70m, resposta.ValorTotal);
        Assert.Equal(2, Assert.Single(resposta.ItensPedido).IdProduto);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Atualizar_QuandoPedidoNaoExiste_DeveLancarNotFoundSemSalvar()
    {
        _pedidoRepository
            .ObterPorIdAsync(404, true, Arg.Any<CancellationToken>())
            .Returns((Pedido?)null);
        var request = new AtualizarPedidoRequest
        {
            NomeCliente = "Cliente",
            EmailCliente = "cliente@example.com",
            ItensPedido = [new ItemPedidoRequest { IdProduto = 1, Quantidade = 1 }]
        };
        PedidoService service = CriarService();

        await Assert.ThrowsAsync<NotFoundException>(() => service.AtualizarAsync(404, request));

        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Remover_QuandoPedidoExiste_DeveRemoverESalvar()
    {
        Pedido pedido = PedidoBuilder.CriarPedido();
        _pedidoRepository
            .ObterPorIdAsync(42, true, Arg.Any<CancellationToken>())
            .Returns(pedido);
        PedidoService service = CriarService();

        await service.RemoverAsync(42);

        _pedidoRepository.Received(1).Remover(pedido);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Criar_QuandoProdutoDuplicado_DeveRejeitarSemPersistir()
    {
        Produto produto = PedidoBuilder.CriarProduto(7, "Produto teste", 25.50m);
        _produtoRepository
            .ObterPorIdsAsync(Arg.Any<IReadOnlyCollection<int>>(), Arg.Any<CancellationToken>())
            .Returns([produto]);
        var request = new CriarPedidoRequest
        {
            NomeCliente = "Cliente Teste",
            EmailCliente = "cliente@teste.com",
            ItensPedido =
            [
                new ItemPedidoRequest { IdProduto = 7, Quantidade = 1 },
                new ItemPedidoRequest { IdProduto = 7, Quantidade = 2 }
            ]
        };
        PedidoService service = CriarService();

        DomainException excecao = await Assert.ThrowsAsync<DomainException>(
            () => service.CriarAsync(request));

        Assert.Contains("mais de uma vez", excecao.Message);
        await _pedidoRepository.DidNotReceive().AdicionarAsync(
            Arg.Any<Pedido>(),
            Arg.Any<CancellationToken>());
    }

    private PedidoService CriarService()
    {
        return new PedidoService(_pedidoRepository, _produtoRepository, _unitOfWork);
    }
}
