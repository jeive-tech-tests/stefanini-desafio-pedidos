using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Application.Abstractions.Persistence;

public interface IPedidoRepository
{
    Task<Pedido?> ObterPorIdAsync(
        int id,
        bool rastrearAlteracoes,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<Pedido> Pedidos, int Total)> ListarAsync(
        int pagina,
        int tamanhoPagina,
        string? nomeCliente,
        bool? pago,
        CancellationToken cancellationToken = default);

    Task AdicionarAsync(Pedido pedido, CancellationToken cancellationToken = default);

    void Remover(Pedido pedido);
}
