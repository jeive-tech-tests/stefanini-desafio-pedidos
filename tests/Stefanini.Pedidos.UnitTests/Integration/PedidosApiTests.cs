using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Stefanini.Pedidos.Application.Models.Common;
using Stefanini.Pedidos.Application.Models.Pedidos;
using Stefanini.Pedidos.Application.Models.Produtos;

namespace Stefanini.Pedidos.UnitTests.Integration;

public sealed class PedidosApiTests : IClassFixture<PedidosApiFactory>
{
    private readonly HttpClient _client;

    public PedidosApiTests(PedidosApiFactory factory)
    {
        _client = factory.CreateClient();
        factory.GarantirBancoCriado();
    }

    [Fact]
    public async Task PostEGet_QuandoPedidoValido_DevePersistirERetornarModeloExigido()
    {
        PedidoResponse criado = await CriarPedidoAsync("Cliente Integração");

        HttpResponseMessage getResponse = await _client.GetAsync($"/api/pedidos/{criado.Id}");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        PedidoResponse? pedido = await getResponse.Content.ReadFromJsonAsync<PedidoResponse>();
        Assert.NotNull(pedido);
        Assert.Equal("Cliente Integração", pedido.NomeCliente);
        Assert.Equal(8_729.70m, pedido.ValorTotal);
        Assert.Collection(
            pedido.ItensPedido.OrderBy(item => item.IdProduto),
            item =>
            {
                Assert.Equal(1, item.IdProduto);
                Assert.Equal("Notebook", item.NomeProduto);
                Assert.Equal(4_299.90m, item.ValorUnitario);
                Assert.Equal(2, item.Quantidade);
            },
            item =>
            {
                Assert.Equal(4, item.IdProduto);
                Assert.Equal("Mouse", item.NomeProduto);
                Assert.Equal(129.90m, item.ValorUnitario);
                Assert.Equal(1, item.Quantidade);
            });
    }

    [Fact]
    public async Task Post_QuandoPayloadInvalido_DeveRetornarValidationProblemDetails()
    {
        var request = new CriarPedidoRequest
        {
            NomeCliente = string.Empty,
            EmailCliente = "email-invalido",
            ItensPedido = []
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/pedidos", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("Falha de validação", body.RootElement.GetProperty("title").GetString());
        Assert.True(body.RootElement.GetProperty("errors").TryGetProperty("NomeCliente", out _));
        Assert.True(body.RootElement.GetProperty("errors").TryGetProperty("EmailCliente", out _));
        Assert.True(body.RootElement.GetProperty("errors").TryGetProperty("ItensPedido", out _));
    }

    [Fact]
    public async Task Get_QuandoPedidoNaoExiste_DeveRetornarProblemDetails404()
    {
        HttpResponseMessage response = await _client.GetAsync("/api/pedidos/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(404, body.RootElement.GetProperty("status").GetInt32());
        Assert.Contains("999999", body.RootElement.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task PutEDelete_QuandoPedidoExiste_DeveCompletarCrud()
    {
        PedidoResponse criado = await CriarPedidoAsync("Cliente para editar");
        var atualizacao = new AtualizarPedidoRequest
        {
            NomeCliente = "Cliente atualizado",
            EmailCliente = "atualizado@example.com",
            Pago = true,
            ItensPedido = [new ItemPedidoRequest { IdProduto = 2, Quantidade = 3 }]
        };

        HttpResponseMessage putResponse = await _client.PutAsJsonAsync(
            $"/api/pedidos/{criado.Id}",
            atualizacao);
        PedidoResponse? atualizado = await putResponse.Content.ReadFromJsonAsync<PedidoResponse>();

        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);
        Assert.NotNull(atualizado);
        Assert.Equal("Cliente atualizado", atualizado.NomeCliente);
        Assert.True(atualizado.Pago);
        Assert.Equal(3_599.70m, atualizado.ValorTotal);

        HttpResponseMessage deleteResponse = await _client.DeleteAsync($"/api/pedidos/{criado.Id}");
        HttpResponseMessage getResponse = await _client.GetAsync($"/api/pedidos/{criado.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task Listar_QuandoFiltrado_DeveRetornarPaginacaoEClienteCorrespondente()
    {
        string nome = $"Filtro {Guid.NewGuid():N}"[..20];
        await CriarPedidoAsync(nome);

        ResultadoPaginado<PedidoResponse>? resultado = await _client.GetFromJsonAsync<
            ResultadoPaginado<PedidoResponse>>(
            $"/api/pedidos?pagina=1&tamanhoPagina=5&nomeCliente={Uri.EscapeDataString(nome)}&pago=false");

        Assert.NotNull(resultado);
        PedidoResponse pedido = Assert.Single(resultado.Itens);
        Assert.Equal(nome, pedido.NomeCliente);
        Assert.Equal(1, resultado.Pagina);
        Assert.Equal(5, resultado.TamanhoPagina);
        Assert.Equal(1, resultado.TotalItens);
        Assert.Equal(1, resultado.TotalPaginas);
    }

    [Fact]
    public async Task Produtos_DeveListarCatalogoEEntregarImagem()
    {
        ProdutoResponse[]? produtos = await _client.GetFromJsonAsync<ProdutoResponse[]>(
            "/api/produtos");

        Assert.NotNull(produtos);
        Assert.Equal(5, produtos.Length);
        Assert.Equal(produtos.OrderBy(produto => produto.NomeProduto), produtos);

        HttpResponseMessage imagem = await _client.GetAsync("/api/produtos/1/imagem");

        Assert.Equal(HttpStatusCode.OK, imagem.StatusCode);
        Assert.Equal("image/svg+xml", imagem.Content.Headers.ContentType?.MediaType);
        Assert.Equal([1, 2, 3], await imagem.Content.ReadAsByteArrayAsync());
    }

    private async Task<PedidoResponse> CriarPedidoAsync(string nomeCliente)
    {
        var request = new CriarPedidoRequest
        {
            NomeCliente = nomeCliente,
            EmailCliente = $"{Guid.NewGuid():N}@example.com",
            Pago = false,
            ItensPedido =
            [
                new ItemPedidoRequest { IdProduto = 1, Quantidade = 2 },
                new ItemPedidoRequest { IdProduto = 4, Quantidade = 1 }
            ]
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/pedidos", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        return await response.Content.ReadFromJsonAsync<PedidoResponse>()
            ?? throw new InvalidOperationException("A API não retornou o pedido criado.");
    }
}
