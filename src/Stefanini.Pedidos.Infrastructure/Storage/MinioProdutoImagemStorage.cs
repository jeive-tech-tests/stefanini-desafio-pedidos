using System.Net;
using Stefanini.Pedidos.Application.Abstractions.Storage;
using Stefanini.Pedidos.Application.Models.Produtos;

namespace Stefanini.Pedidos.Infrastructure.Storage;

public sealed class MinioProdutoImagemStorage(HttpClient httpClient) : IProdutoImagemStorage
{
    public async Task<ProdutoImagemResponse?> ObterAsync(
        string objeto,
        CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response = await httpClient.GetAsync(
            Uri.EscapeDataString(objeto),
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        byte[] conteudo = await response.Content.ReadAsByteArrayAsync(cancellationToken);
        string tipoConteudo = response.Content.Headers.ContentType?.MediaType
            ?? "application/octet-stream";

        return new ProdutoImagemResponse(conteudo, tipoConteudo);
    }
}
