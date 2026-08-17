using System.ComponentModel.DataAnnotations;

namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed class CriarPedidoRequest
{
    [Required(ErrorMessage = "O nome do cliente é obrigatório.")]
    [MaxLength(60, ErrorMessage = "O nome do cliente deve ter no máximo 60 caracteres.")]
    public string NomeCliente { get; init; } = string.Empty;

    [Required(ErrorMessage = "O e-mail do cliente é obrigatório.")]
    [EmailAddress(ErrorMessage = "O e-mail do cliente é inválido.")]
    [MaxLength(60, ErrorMessage = "O e-mail do cliente deve ter no máximo 60 caracteres.")]
    public string EmailCliente { get; init; } = string.Empty;

    public bool Pago { get; init; }

    [Required(ErrorMessage = "Os itens do pedido são obrigatórios.")]
    [MinLength(1, ErrorMessage = "O pedido deve possuir ao menos um item.")]
    public IReadOnlyCollection<ItemPedidoRequest> ItensPedido { get; init; } = [];
}
