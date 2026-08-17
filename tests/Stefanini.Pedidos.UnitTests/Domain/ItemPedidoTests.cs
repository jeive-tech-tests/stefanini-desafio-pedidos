using Stefanini.Pedidos.Domain.Entities;

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
}
