using System.ComponentModel.DataAnnotations;

namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed class ItemPedidoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "O produto informado é inválido.")]
    public int IdProduto { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero.")]
    public int Quantidade { get; init; }
}
