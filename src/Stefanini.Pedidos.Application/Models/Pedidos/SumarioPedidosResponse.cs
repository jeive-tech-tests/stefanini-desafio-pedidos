namespace Stefanini.Pedidos.Application.Models.Pedidos;

public sealed record SumarioPedidosResponse(
    int TotalPedidos,
    decimal ValorTotal,
    int PedidosPagos,
    int PedidosPendentes);
