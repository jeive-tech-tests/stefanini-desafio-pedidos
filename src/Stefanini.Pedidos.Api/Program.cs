using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Stefanini.Pedidos.Api.ExceptionHandling;
using Stefanini.Pedidos.Application;
using Stefanini.Pedidos.Infrastructure;
using Stefanini.Pedidos.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddHealthChecks();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;
});
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var problemDetails = new ValidationProblemDetails(context.ModelState)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Falha de validação",
            Detail = "Um ou mais campos possuem valores inválidos.",
            Type = "https://httpstatuses.com/400",
            Instance = context.HttpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
        return new ObjectResult(problemDetails)
        {
            StatusCode = StatusCodes.Status400BadRequest,
            ContentTypes = { "application/problem+json" }
        };
    };
});

string[] allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Stefanini - API de Pedidos",
        Version = "v1",
        Description = "API REST para gerenciamento de pedidos e seus itens."
    });
});

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
{
    await using AsyncServiceScope scope = app.Services.CreateAsyncScope();
    PedidosDbContext dbContext = scope.ServiceProvider.GetRequiredService<PedidosDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.UseForwardedHeaders();

string pathBase = app.Configuration["Hosting:PathBase"]?.TrimEnd('/') ?? string.Empty;

if (!string.IsNullOrWhiteSpace(pathBase))
{
    if (!pathBase.StartsWith('/'))
    {
        throw new InvalidOperationException("O PathBase deve começar com '/'.");
    }

    app.UsePathBase(pathBase);
}

app.UseExceptionHandler();
app.UseStaticFiles();
app.UseSwagger(options =>
{
    options.PreSerializeFilters.Add((document, request) =>
    {
        if (request.PathBase.HasValue)
        {
            document.Servers = [new OpenApiServer { Url = request.PathBase.Value! }];
        }
    });
});
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("v1/swagger.json", "Stefanini - API de Pedidos v1");
    options.RoutePrefix = "swagger";
});

app.UseRouting();
app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/", (IWebHostEnvironment environment) =>
    {
        string indexFile = Path.Combine(environment.WebRootPath ?? string.Empty, "index.html");
        return File.Exists(indexFile)
            ? Results.File(indexFile, "text/html; charset=utf-8")
            : Results.Redirect("/swagger");
    })
    .ExcludeFromDescription();
app.MapFallback(async context =>
{
    if (context.Request.Path.StartsWithSegments("/api") ||
        context.Request.Path.StartsWithSegments("/swagger") ||
        context.Request.Path.StartsWithSegments("/health"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    string indexFile = Path.Combine(app.Environment.WebRootPath ?? string.Empty, "index.html");

    if (!File.Exists(indexFile))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync(indexFile);
});

app.Run();

public partial class Program;
