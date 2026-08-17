using Stefanini.Pedidos.Application.Models.Produtos;

namespace Stefanini.Pedidos.Application.Abstractions.Storage;

public interface IProdutoImagemStorage
{
    Task<ProdutoImagemResponse?> ObterAsync(
        string objeto,
        CancellationToken cancellationToken = default);
}
