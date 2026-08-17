using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.Domain.Entities;

public sealed class ItemPedido
{
    private ItemPedido()
    {
    }

    public ItemPedido(Produto produto, int quantidade)
    {
        if (produto is null)
        {
            throw new DomainException("O produto informado é inválido.");
        }

        if (produto.Valor <= 0)
        {
            throw new DomainException("O valor unitário deve ser maior que zero.");
        }

        if (quantidade <= 0)
        {
            throw new DomainException("A quantidade deve ser maior que zero.");
        }

        Produto = produto;
        ProdutoId = produto.Id;
        ValorUnitario = produto.Valor;
        Quantidade = quantidade;
    }

    public int Id { get; private set; }

    public int PedidoId { get; private set; }

    public int ProdutoId { get; private set; }

    public decimal ValorUnitario { get; private set; }

    public int Quantidade { get; private set; }

    public decimal Subtotal => ValorUnitario * Quantidade;

    public Pedido Pedido { get; private set; } = null!;

    public Produto Produto { get; private set; } = null!;
}
