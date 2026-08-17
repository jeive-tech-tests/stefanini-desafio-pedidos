using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.UnitTests.Domain;

public sealed class ItemPedidoTests
{
    [Fact]
    public void CriarItem_DevePreservarValorPraticadoMesmoSeProdutoForAtualizado()
    {
        var produto = new Produto("Produto teste", 10.00m);
        var item = new ItemPedido(produto, quantidade: 2);

        produto.Atualizar("Produto teste", 15.00m);

        Assert.Equal(10.00m, item.ValorUnitario);
        Assert.Equal(20.00m, item.Subtotal);
    }

    [Fact]
    public void CriarItem_ComProdutoNulo_DeveRejeitar()
    {
        Assert.Throws<DomainException>(() => new ItemPedido(null!, 1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void CriarItem_ComQuantidadeNaoPositiva_DeveRejeitar(int quantidade)
    {
        var produto = new Produto("Produto", 10m);

        Assert.Throws<DomainException>(() => new ItemPedido(produto, quantidade));
    }
}
