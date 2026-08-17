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
    public static TheoryData<TipoExcecao, int, string> Cenários => new()
    {
        { TipoExcecao.NaoEncontrado, 404, "Recurso não encontrado" },
        { TipoExcecao.Dominio, 400, "Dados inválidos" },
        { TipoExcecao.Persistencia, 409, "Conflito ao persistir os dados" },
        { TipoExcecao.Inesperada, 500, "Erro interno" }
    };

    [Theory]
    [MemberData(nameof(Cenários))]
    public async Task TryHandle_DeveMapearExcecaoParaProblemDetails(
        TipoExcecao tipoExcecao,
        int statusEsperado,
        string tituloEsperado)
    {
        ILogger<GlobalExceptionHandler> logger = Substitute.For<ILogger<GlobalExceptionHandler>>();
        var problemDetailsService = new ProblemDetailsServiceFake();
        var handler = new GlobalExceptionHandler(logger, problemDetailsService);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/pedidos/42";
        Exception exception = CriarExcecao(tipoExcecao);

        bool tratado = await handler.TryHandleAsync(
            httpContext,
            exception,
            CancellationToken.None);

        Assert.True(tratado);
        Assert.Equal(statusEsperado, httpContext.Response.StatusCode);
        Assert.NotNull(problemDetailsService.ContextoCapturado);
        ProblemDetails problem = problemDetailsService.ContextoCapturado.ProblemDetails;
        Assert.Equal(statusEsperado, problem.Status);
        Assert.Equal(tituloEsperado, problem.Title);
        Assert.Equal("/api/pedidos/42", problem.Instance);
        Assert.True(problem.Extensions.ContainsKey("traceId"));
    }

    private static Exception CriarExcecao(TipoExcecao tipoExcecao)
    {
        return tipoExcecao switch
        {
            TipoExcecao.NaoEncontrado => new NotFoundException("Pedido não encontrado."),
            TipoExcecao.Dominio => new DomainException("Quantidade inválida."),
            TipoExcecao.Persistencia => new DbUpdateException("Conflito."),
            _ => new InvalidOperationException("Falha interna.")
        };
    }

    public enum TipoExcecao
    {
        NaoEncontrado,
        Dominio,
        Persistencia,
        Inesperada
    }

    private sealed class ProblemDetailsServiceFake : IProblemDetailsService
    {
        public ProblemDetailsContext? ContextoCapturado { get; private set; }

        public ValueTask WriteAsync(ProblemDetailsContext context)
        {
            ContextoCapturado = context;
            return ValueTask.CompletedTask;
        }

        public ValueTask<bool> TryWriteAsync(ProblemDetailsContext context)
        {
            ContextoCapturado = context;
            return ValueTask.FromResult(true);
        }
    }
}
