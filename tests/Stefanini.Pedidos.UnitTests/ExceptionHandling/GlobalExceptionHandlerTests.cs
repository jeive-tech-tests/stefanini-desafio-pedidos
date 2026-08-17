using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Stefanini.Pedidos.Api.ExceptionHandling;
using Stefanini.Pedidos.Application.Exceptions;
using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.UnitTests.ExceptionHandling;

public sealed class GlobalExceptionHandlerTests
{
    public static TheoryData<Exception, int, string> Cenários => new()
    {
        { new NotFoundException("Pedido não encontrado."), 404, "Recurso não encontrado" },
        { new DomainException("Quantidade inválida."), 400, "Dados inválidos" },
        { new DbUpdateException("Conflito."), 409, "Conflito ao persistir os dados" },
        { new InvalidOperationException("Falha interna."), 500, "Erro interno" }
    };

    [Theory]
    [MemberData(nameof(Cenários))]
    public async Task TryHandle_DeveMapearExcecaoParaProblemDetails(
        Exception exception,
        int statusEsperado,
        string tituloEsperado)
    {
        ILogger<GlobalExceptionHandler> logger = Substitute.For<ILogger<GlobalExceptionHandler>>();
        IProblemDetailsService problemDetailsService = Substitute.For<IProblemDetailsService>();
        ProblemDetailsContext? contextoCapturado = null;
        problemDetailsService
            .TryWriteAsync(Arg.Do<ProblemDetailsContext>(contexto => contextoCapturado = contexto))
            .Returns(_ => new ValueTask<bool>(true));
        var handler = new GlobalExceptionHandler(logger, problemDetailsService);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/pedidos/42";

        bool tratado = await handler.TryHandleAsync(
            httpContext,
            exception,
            CancellationToken.None);

        Assert.True(tratado);
        Assert.Equal(statusEsperado, httpContext.Response.StatusCode);
        Assert.NotNull(contextoCapturado);
        ProblemDetails problem = contextoCapturado.ProblemDetails;
        Assert.Equal(statusEsperado, problem.Status);
        Assert.Equal(tituloEsperado, problem.Title);
        Assert.Equal("/api/pedidos/42", problem.Instance);
        Assert.True(problem.Extensions.ContainsKey("traceId"));
    }
}
