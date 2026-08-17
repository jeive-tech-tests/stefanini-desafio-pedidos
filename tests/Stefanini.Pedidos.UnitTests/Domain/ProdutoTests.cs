using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.UnitTests.Domain;

public sealed class ProdutoTests
{
    [Fact]
    public void CriarProduto_DeveNormalizarNomeEArredondarValor()
    {
        var produto = new Produto("  Produto  ", 10.126m, " imagem.svg ");

        Assert.Equal("Produto", produto.NomeProduto);
        Assert.Equal(10.13m, produto.Valor);
        Assert.Equal("imagem.svg", produto.ImagemObjeto);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void CriarProduto_ComValorNaoPositivo_DeveRejeitar(decimal valor)
    {
        Assert.Throws<DomainException>(() => new Produto("Produto", valor));
    }

    [Fact]
    public void CriarProduto_ComNomeMaiorQueLimite_DeveRejeitar()
    {
        Assert.Throws<DomainException>(() => new Produto(new string('A', 21), 10m));
    }

    [Fact]
    public void AtualizarProduto_SemNovaImagem_DevePreservarObjetoAtual()
    {
        var produto = new Produto("Produto", 10m, "original.svg");

        produto.Atualizar("Atualizado", 20m);

        Assert.Equal("Atualizado", produto.NomeProduto);
        Assert.Equal(20m, produto.Valor);
        Assert.Equal("original.svg", produto.ImagemObjeto);
    }
}
