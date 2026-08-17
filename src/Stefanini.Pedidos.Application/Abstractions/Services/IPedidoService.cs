using Stefanini.Pedidos.Application.Models.Common;
using Stefanini.Pedidos.Application.Models.Pedidos;

namespace Stefanini.Pedidos.Application.Abstractions.Services;

public interface IPedidoService
{
    Task<PedidoResponse> CriarAsync(
        CriarPedidoRequest request,
        CancellationToken cancellationToken = default);

    Task<PedidoResponse> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ResultadoPaginado<PedidoResponse>> ListarAsync(
        PedidosQuery query,
        CancellationToken cancellationToken = default);

    Task<SumarioPedidosResponse> ObterSumarioAsync(
        CancellationToken cancellationToken = default);

    Task<PedidoResponse> AtualizarAsync(
        int id,
        AtualizarPedidoRequest request,
        CancellationToken cancellationToken = default);

    Task RemoverAsync(int id, CancellationToken cancellationToken = default);
}
