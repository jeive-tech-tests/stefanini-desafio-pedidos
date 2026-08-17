using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Application.Models.Common;
using Stefanini.Pedidos.Application.Models.Pedidos;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Application.Services;

public sealed class PedidoService(
    IPedidoRepository pedidoRepository,
    IProdutoRepository produtoRepository,
    IUnitOfWork unitOfWork) : IPedidoService
{
    public async Task<PedidoResponse> CriarAsync(
        CriarPedidoRequest request,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<ItemPedido> itens = await CriarItensAsync(
            request.ItensPedido,
            cancellationToken);

        var pedido = new Pedido(
            request.NomeCliente,
            request.EmailCliente,
            request.Pago,
            itens);

        await pedidoRepository.AdicionarAsync(pedido, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(pedido.Id, cancellationToken);
    }

    public async Task<PedidoResponse> ObterPorIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        Pedido pedido = await pedidoRepository.ObterPorIdAsync(
                id,
                rastrearAlteracoes: false,
                cancellationToken)
            ?? throw new NotFoundException($"Pedido com id {id} não encontrado.");

        return MapearResposta(pedido);
    }

    public async Task<ResultadoPaginado<PedidoResponse>> ListarAsync(
        PedidosQuery query,
        CancellationToken cancellationToken = default)
    {
        (IReadOnlyCollection<Pedido> pedidos, int total) = await pedidoRepository.ListarAsync(
            query.Pagina,
            query.TamanhoPagina,
            query.NomeCliente?.Trim(),
            query.IdProduto,
            query.Pago,
            cancellationToken);

        IReadOnlyCollection<PedidoResponse> respostas = pedidos
            .Select(MapearResposta)
            .ToArray();

        int totalPaginas = total == 0
            ? 0
            : (int)Math.Ceiling(total / (double)query.TamanhoPagina);

        return new ResultadoPaginado<PedidoResponse>(
            respostas,
            query.Pagina,
            query.TamanhoPagina,
            total,
            totalPaginas);
    }

    public Task<SumarioPedidosResponse> ObterSumarioAsync(
        CancellationToken cancellationToken = default)
    {
        return pedidoRepository.ObterSumarioAsync(cancellationToken);
    }

    public async Task<PedidoResponse> AtualizarAsync(
        int id,
        AtualizarPedidoRequest request,
        CancellationToken cancellationToken = default)
    {
        Pedido pedido = await pedidoRepository.ObterPorIdAsync(
                id,
                rastrearAlteracoes: true,
                cancellationToken)
            ?? throw new NotFoundException($"Pedido com id {id} não encontrado.");

        IReadOnlyCollection<ItemPedido> itens = await CriarItensAsync(
            request.ItensPedido,
            cancellationToken);

        pedido.Atualizar(
            request.NomeCliente,
            request.EmailCliente,
            request.Pago,
            itens);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(id, cancellationToken);
    }

    public async Task RemoverAsync(int id, CancellationToken cancellationToken = default)
    {
        Pedido pedido = await pedidoRepository.ObterPorIdAsync(
                id,
                rastrearAlteracoes: true,
                cancellationToken)
            ?? throw new NotFoundException($"Pedido com id {id} não encontrado.");

        pedidoRepository.Remover(pedido);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<ItemPedido>> CriarItensAsync(
        IReadOnlyCollection<ItemPedidoRequest> itensRequest,
        CancellationToken cancellationToken)
    {
        int[] idsProdutos = itensRequest
            .Select(item => item.IdProduto)
            .Distinct()
            .ToArray();

        IReadOnlyCollection<Produto> produtos = await produtoRepository.ObterPorIdsAsync(
            idsProdutos,
            cancellationToken);

        Dictionary<int, Produto> produtosPorId = produtos.ToDictionary(produto => produto.Id);
        int[] idsInexistentes = idsProdutos
            .Where(idProduto => !produtosPorId.ContainsKey(idProduto))
            .ToArray();

        if (idsInexistentes.Length > 0)
        {
            throw new NotFoundException(
                $"Produto(s) não encontrado(s): {string.Join(", ", idsInexistentes)}.");
        }

        return itensRequest
            .Select(item =>
            {
                Produto produto = produtosPorId[item.IdProduto];
                return new ItemPedido(produto, item.Quantidade);
            })
            .ToArray();
    }

    private static PedidoResponse MapearResposta(Pedido pedido)
    {
        ItemPedidoResponse[] itens = pedido.ItensPedido
            .OrderBy(item => item.Id)
            .Select(item => new ItemPedidoResponse(
                item.Id,
                item.ProdutoId,
                item.Produto.NomeProduto,
                item.ValorUnitario,
                item.Quantidade))
            .ToArray();

        return new PedidoResponse(
            pedido.Id,
            pedido.NomeCliente,
            pedido.EmailCliente,
            pedido.Pago,
            pedido.ValorTotal,
            itens);
    }
}
