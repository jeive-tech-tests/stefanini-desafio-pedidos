using Stefanini.Pedidos.Application.Models.Produtos;

namespace Stefanini.Pedidos.Application.Abstractions.Services;

public interface IProdutoService
{
    Task<IReadOnlyCollection<ProdutoResponse>> ListarAsync(
        CancellationToken cancellationToken = default);

    Task<ProdutoImagemResponse> ObterImagemAsync(
        int id,
        CancellationToken cancellationToken = default);
}
