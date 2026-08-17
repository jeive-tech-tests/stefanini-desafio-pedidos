using System.Net;
using System.Net.Http.Headers;
using Stefanini.Pedidos.Application.Models.Produtos;
using Stefanini.Pedidos.Infrastructure.Storage;

namespace Stefanini.Pedidos.UnitTests.Storage;

public sealed class MinioProdutoImagemStorageTests
{
    [Fact]
    public async Task Obter_QuandoObjetoExiste_DeveRetornarConteudoETipo()
    {
        using HttpClient client = CriarClient(_ =>
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent([1, 2, 3])
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            return response;
        });
        var storage = new MinioProdutoImagemStorage(client);

        ProdutoImagemResponse? imagem = await storage.ObterAsync("imagem com espaço.png");

        Assert.NotNull(imagem);
        Assert.Equal([1, 2, 3], imagem.Conteudo);
        Assert.Equal("image/png", imagem.TipoConteudo);
    }

    [Fact]
    public async Task Obter_QuandoObjetoNaoExiste_DeveRetornarNulo()
    {
        using HttpClient client = CriarClient(_ => new HttpResponseMessage(HttpStatusCode.NotFound));
        var storage = new MinioProdutoImagemStorage(client);

        ProdutoImagemResponse? imagem = await storage.ObterAsync("inexistente.svg");

        Assert.Null(imagem);
    }

    [Fact]
    public async Task Obter_SemContentType_DeveUsarTipoBinarioPadrao()
    {
        using HttpClient client = CriarClient(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new ByteArrayContent([4, 5])
        });
        var storage = new MinioProdutoImagemStorage(client);

        ProdutoImagemResponse? imagem = await storage.ObterAsync("arquivo.bin");

        Assert.NotNull(imagem);
        Assert.Equal("application/octet-stream", imagem.TipoConteudo);
    }

    [Fact]
    public async Task Obter_QuandoStorageFalha_DevePropagarErroHttp()
    {
        using HttpClient client = CriarClient(_ =>
            new HttpResponseMessage(HttpStatusCode.InternalServerError));
        var storage = new MinioProdutoImagemStorage(client);

        await Assert.ThrowsAsync<HttpRequestException>(() => storage.ObterAsync("imagem.svg"));
    }

    private static HttpClient CriarClient(Func<HttpRequestMessage, HttpResponseMessage> responder)
    {
        return new HttpClient(new HttpMessageHandlerFake(responder))
        {
            BaseAddress = new Uri("http://minio/produtos/")
        };
    }

    private sealed class HttpMessageHandlerFake(
        Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(responder(request));
        }
    }
}
