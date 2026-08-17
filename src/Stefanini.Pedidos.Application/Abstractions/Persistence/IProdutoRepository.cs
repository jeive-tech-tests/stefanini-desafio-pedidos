using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Application.Abstractions.Persistence;

public interface IProdutoRepository
{
    Task<IReadOnlyCollection<Produto>> ListarAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Produto>> ObterPorIdsAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken = default);
}
