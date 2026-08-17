using Microsoft.EntityFrameworkCore;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Infrastructure.Persistence.Repositories;

public sealed class ProdutoRepository(PedidosDbContext context) : IProdutoRepository
{
    public async Task<IReadOnlyCollection<Produto>> ListarAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.Produtos
            .AsNoTracking()
            .OrderBy(produto => produto.NomeProduto)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Produto>> ObterPorIdsAsync(
        IReadOnlyCollection<int> ids,
        CancellationToken cancellationToken = default)
    {
        return await context.Produtos
            .AsNoTracking()
            .Where(produto => ids.Contains(produto.Id))
            .ToListAsync(cancellationToken);
    }
}
