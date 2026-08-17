namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed record ItemPedidoResponse(
    int Id,
    int IdProduto,
    string NomeProduto,
    decimal ValorUnitario,
    int Quantidade);
