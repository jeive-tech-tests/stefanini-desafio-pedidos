namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed record PedidoResponse(
    int Id,
    string NomeCliente,
    string EmailCliente,
    bool Pago,
    decimal ValorTotal,
    IReadOnlyCollection<ItemPedidoResponse> ItensPedido);
