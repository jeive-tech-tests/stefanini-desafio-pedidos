using NSubstitute;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Abstractions.Storage;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Application.Models.Produtos;
using Stefanini.Pedidos.Application.Services;
using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.UnitTests.Builders;

namespace Stefanini.Pedidos.UnitTests.Services;

public sealed class ProdutoServiceTests
{
    private readonly IProdutoRepository _repository = Substitute.For<IProdutoRepository>();
    private readonly IProdutoImagemStorage _storage = Substitute.For<IProdutoImagemStorage>();

    [Fact]
    public async Task ObterImagem_QuandoExiste_DeveRetornarConteudoDoStorage()
    {
        Produto produto = PedidoBuilder.CriarProduto(1, "Notebook", 100m);
        produto.Atualizar("Notebook", 100m, "notebook.svg");
        var imagem = new ProdutoImagemResponse([1, 2, 3], "image/svg+xml");
        _repository.ObterPorIdAsync(1, Arg.Any<CancellationToken>()).Returns(produto);
        _storage.ObterAsync("notebook.svg", Arg.Any<CancellationToken>()).Returns(imagem);

        var service = new ProdutoService(_repository, _storage);

        ProdutoImagemResponse resposta = await service.ObterImagemAsync(1, CancellationToken.None);

        Assert.Equal("image/svg+xml", resposta.TipoConteudo);
        Assert.Equal([1, 2, 3], resposta.Conteudo);
    }

    [Fact]
    public async Task ObterImagem_QuandoProdutoNaoExiste_DeveLancarNotFound()
    {
        _repository.ObterPorIdAsync(404, Arg.Any<CancellationToken>()).Returns((Produto?)null);
        var service = new ProdutoService(_repository, _storage);

        await Assert.ThrowsAsync<NotFoundException>(
            () => service.ObterImagemAsync(404, CancellationToken.None));

        await _storage.DidNotReceive().ObterAsync(
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Listar_DeveMapearProdutosDoRepositorio()
    {
        _repository.ListarAsync(Arg.Any<CancellationToken>()).Returns(
            [
                PedidoBuilder.CriarProduto(1, "Notebook", 4_299.90m),
                PedidoBuilder.CriarProduto(4, "Mouse", 129.90m)
            ]);
        var service = new ProdutoService(_repository, _storage);

        IReadOnlyCollection<ProdutoResponse> resposta = await service.ListarAsync();

        Assert.Collection(
            resposta,
            notebook =>
            {
                Assert.Equal(1, notebook.Id);
                Assert.Equal("Notebook", notebook.NomeProduto);
                Assert.Equal(4_299.90m, notebook.Valor);
            },
            mouse =>
            {
                Assert.Equal(4, mouse.Id);
                Assert.Equal("Mouse", mouse.NomeProduto);
                Assert.Equal(129.90m, mouse.Valor);
            });
    }

    [Fact]
    public async Task ObterImagem_QuandoStorageNaoEncontra_DeveLancarNotFound()
    {
        Produto produto = PedidoBuilder.CriarProduto(1, "Notebook", 100m);
        _repository.ObterPorIdAsync(1, Arg.Any<CancellationToken>()).Returns(produto);
        _storage.ObterAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((ProdutoImagemResponse?)null);
        var service = new ProdutoService(_repository, _storage);

        NotFoundException excecao = await Assert.ThrowsAsync<NotFoundException>(
            () => service.ObterImagemAsync(1));

        Assert.Contains("Imagem", excecao.Message);
    }
}
