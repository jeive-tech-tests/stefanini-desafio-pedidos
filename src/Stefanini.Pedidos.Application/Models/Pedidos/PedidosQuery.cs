using System.ComponentModel.DataAnnotations;

namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed class PedidosQuery
{
    [Range(1, int.MaxValue, ErrorMessage = "A página deve ser maior que zero.")]
    public int Pagina { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "O tamanho da página deve estar entre 1 e 100.")]
    public int TamanhoPagina { get; init; } = 10;

    [MaxLength(60, ErrorMessage = "O filtro de cliente deve ter no máximo 60 caracteres.")]
    public string? NomeCliente { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "O produto informado é inválido.")]
    public int? IdProduto { get; init; }

    public bool? Pago { get; init; }
}
