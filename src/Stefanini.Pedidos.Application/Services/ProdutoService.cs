using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Abstractions.Storage;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Application.Models.Produtos;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Application.Services;

public sealed class ProdutoService(
    IProdutoRepository produtoRepository,
    IProdutoImagemStorage imagemStorage) : IProdutoService
{
    public async Task<IReadOnlyCollection<ProdutoResponse>> ListarAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<Produto> produtos = await produtoRepository.ListarAsync(cancellationToken);

        return produtos
            .Select(produto => new ProdutoResponse(produto.Id, produto.NomeProduto, produto.Valor))
            .ToArray();
    }

    public async Task<ProdutoImagemResponse> ObterImagemAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        Produto produto = await produtoRepository.ObterPorIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Produto {id} não encontrado.");

        ProdutoImagemResponse? imagem = await imagemStorage.ObterAsync(
            produto.ImagemObjeto,
            cancellationToken);

        return imagem
            ?? throw new NotFoundException($"Imagem do produto {id} não encontrada.");
    }
}
