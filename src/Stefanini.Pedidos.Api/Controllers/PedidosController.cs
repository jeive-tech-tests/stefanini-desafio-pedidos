using Microsoft.AspNetCore.Mvc;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Models.Common;
using Stefanini.Pedidos.Application.Models.Pedidos;

namespace Stefanini.Pedidos.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
[Produces("application/json")]
public sealed class PedidosController(IPedidoService pedidoService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<PedidoResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PedidoResponse>> Criar(
        [FromBody] CriarPedidoRequest request,
        CancellationToken cancellationToken)
    {
        PedidoResponse pedido = await pedidoService.CriarAsync(request, cancellationToken);

        return CreatedAtAction(nameof(ObterPorId), new { id = pedido.Id }, pedido);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<PedidoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PedidoResponse>> ObterPorId(
        int id,
        CancellationToken cancellationToken)
    {
        PedidoResponse pedido = await pedidoService.ObterPorIdAsync(id, cancellationToken);
        return Ok(pedido);
    }

    [HttpGet]
    [ProducesResponseType<ResultadoPaginado<PedidoResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResultadoPaginado<PedidoResponse>>> Listar(
        [FromQuery] PedidosQuery query,
        CancellationToken cancellationToken)
    {
        ResultadoPaginado<PedidoResponse> resultado = await pedidoService.ListarAsync(
            query,
            cancellationToken);

        return Ok(resultado);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<PedidoResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PedidoResponse>> Atualizar(
        int id,
        [FromBody] AtualizarPedidoRequest request,
        CancellationToken cancellationToken)
    {
        PedidoResponse pedido = await pedidoService.AtualizarAsync(
            id,
            request,
            cancellationToken);

        return Ok(pedido);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Remover(int id, CancellationToken cancellationToken)
    {
        await pedidoService.RemoverAsync(id, cancellationToken);
        return NoContent();
    }
}
