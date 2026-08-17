using System.Reflection;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.UnitTests.Builders;

internal static class PedidoBuilder
{
    public static Pedido CriarPedido(
        int pedidoId = 42,
        int produtoId = 7,
        int itemId = 10,
        decimal valorUnitario = 25.50m,
        int quantidade = 2)
    {
        Produto produto = CriarProduto(produtoId, "Produto teste", valorUnitario);
        var item = new ItemPedido(produto, quantidade);
        DefinirId(item, itemId);

        var pedido = new Pedido(
            "Cliente Teste",
            "cliente@teste.com",
            pago: false,
            [item],
            new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc));

        DefinirId(pedido, pedidoId);
        return pedido;
    }

    public static Produto CriarProduto(int id, string nome, decimal valor)
    {
        var produto = new Produto(nome, valor);
        DefinirId(produto, id);
        return produto;
    }

    public static void DefinirId<T>(T entidade, int id)
        where T : class
    {
        PropertyInfo propriedade = typeof(T).GetProperty(nameof(Pedido.Id))
            ?? throw new InvalidOperationException(
                $"A entidade {typeof(T).Name} não possui uma propriedade Id.");

        propriedade.SetValue(entidade, id);
    }
}
