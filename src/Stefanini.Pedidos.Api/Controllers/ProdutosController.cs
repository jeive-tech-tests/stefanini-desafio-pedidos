using Microsoft.AspNetCore.Mvc;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Models.Produtos;

namespace Stefanini.Pedidos.Api.Controllers;

[ApiController]
[Route("api/produtos")]
[Produces("application/json")]
public sealed class ProdutosController(IProdutoService produtoService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<ProdutoResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ProdutoResponse>>> Listar(
        CancellationToken cancellationToken)
    {
        IReadOnlyCollection<ProdutoResponse> produtos = await produtoService.ListarAsync(
            cancellationToken);

        return Ok(produtos);
    }
}
