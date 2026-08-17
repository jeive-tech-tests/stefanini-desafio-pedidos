using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Stefanini.Pedidos.Api.Controllers;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Models.Pedidos;

namespace Stefanini.Pedidos.UnitTests.Controllers;

public sealed class PedidosControllerTests
{
    private readonly IPedidoService _pedidoService = Substitute.For<IPedidoService>();

    [Fact]
    public async Task ObterPorId_QuandoPedidoExiste_DeveRetornarOkComPedido()
    {
        PedidoResponse resposta = CriarResposta(id: 42);
        _pedidoService
            .ObterPorIdAsync(42, Arg.Any<CancellationToken>())
            .Returns(resposta);

        var controller = new PedidosController(_pedidoService);

        ActionResult<PedidoResponse> resultado = await controller.ObterPorId(
            42,
            CancellationToken.None);

        OkObjectResult ok = Assert.IsType<OkObjectResult>(resultado.Result);
        PedidoResponse pedido = Assert.IsType<PedidoResponse>(ok.Value);
        Assert.Same(resposta, pedido);
        await _pedidoService.Received(1).ObterPorIdAsync(42, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Criar_QuandoPayloadValido_DeveRetornarCreatedAtAction()
    {
        var request = new CriarPedidoRequest
        {
            NomeCliente = "Cliente Teste",
            EmailCliente = "cliente@teste.com",
            ItensPedido = [new ItemPedidoRequest { IdProduto = 7, Quantidade = 2 }]
        };

        PedidoResponse resposta = CriarResposta(id: 99);
        _pedidoService
            .CriarAsync(request, Arg.Any<CancellationToken>())
            .Returns(resposta);

        var controller = new PedidosController(_pedidoService);

        ActionResult<PedidoResponse> resultado = await controller.Criar(
            request,
            CancellationToken.None);

        CreatedAtActionResult created = Assert.IsType<CreatedAtActionResult>(resultado.Result);
        Assert.Equal(nameof(PedidosController.ObterPorId), created.ActionName);
        Assert.Equal(99, created.RouteValues?["id"]);
        Assert.Same(resposta, created.Value);
        await _pedidoService.Received(1).CriarAsync(request, Arg.Any<CancellationToken>());
    }

    private static PedidoResponse CriarResposta(int id)
    {
        return new PedidoResponse(
            id,
            "Cliente Teste",
            "cliente@teste.com",
            false,
            51.00m,
            [new ItemPedidoResponse(10, 7, "Produto teste", 25.50m, 2)]);
    }
}
