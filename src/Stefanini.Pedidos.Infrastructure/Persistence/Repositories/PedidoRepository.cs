using Microsoft.EntityFrameworkCore;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Infrastructure.Persistence.Repositories;

public sealed class PedidoRepository(PedidosDbContext context) : IPedidoRepository
{
    public async Task<Pedido?> ObterPorIdAsync(
        int id,
        bool rastrearAlteracoes,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Pedido> query = ConsultaCompleta();

        if (!rastrearAlteracoes)
        {
            query = query.AsNoTracking();
        }

        return await query.SingleOrDefaultAsync(
            pedido => pedido.Id == id,
            cancellationToken);
    }

    public async Task<(IReadOnlyCollection<Pedido> Pedidos, int Total)> ListarAsync(
        int pagina,
        int tamanhoPagina,
        string? nomeCliente,
        bool? pago,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Pedido> query = ConsultaCompleta().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(nomeCliente))
        {
            query = query.Where(pedido => pedido.NomeCliente.Contains(nomeCliente));
        }

        if (pago.HasValue)
        {
            query = query.Where(pedido => pedido.Pago == pago.Value);
        }

        int total = await query.CountAsync(cancellationToken);
        List<Pedido> pedidos = await query
            .OrderByDescending(pedido => pedido.DataCriacao)
            .ThenByDescending(pedido => pedido.Id)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(cancellationToken);

        return (pedidos, total);
    }

    public async Task AdicionarAsync(
        Pedido pedido,
        CancellationToken cancellationToken = default)
    {
        await context.Pedidos.AddAsync(pedido, cancellationToken);
    }

    public void Remover(Pedido pedido)
    {
        context.Pedidos.Remove(pedido);
    }

    private IQueryable<Pedido> ConsultaCompleta()
    {
        return context.Pedidos
            .Include(pedido => pedido.ItensPedido)
            .ThenInclude(item => item.Produto)
            .AsSplitQuery();
    }
}
