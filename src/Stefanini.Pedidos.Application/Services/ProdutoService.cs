using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Models.Produtos;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Application.Services;

public sealed class ProdutoService(IProdutoRepository produtoRepository) : IProdutoService
{
    public async Task<IReadOnlyCollection<ProdutoResponse>> ListarAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<Produto> produtos = await produtoRepository.ListarAsync(cancellationToken);

        return produtos
            .Select(produto => new ProdutoResponse(produto.Id, produto.NomeProduto, produto.Valor))
            .ToArray();
    }
}
