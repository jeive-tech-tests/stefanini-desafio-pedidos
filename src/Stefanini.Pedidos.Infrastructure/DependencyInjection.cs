using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stefanini.Pedidos.Application.Abstractions.Persistence;
using Stefanini.Pedidos.Application.Abstractions.Storage;
using Stefanini.Pedidos.Infrastructure.Persistence;
using Stefanini.Pedidos.Infrastructure.Persistence.Repositories;
using Stefanini.Pedidos.Infrastructure.Storage;

namespace Stefanini.Pedidos.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PedidosDb")
            ?? throw new InvalidOperationException(
                "A connection string 'PedidosDb' não foi configurada.");

        services.AddDbContext<PedidosDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions =>
                sqlOptions.MigrationsAssembly(typeof(PedidosDbContext).Assembly.FullName)));

        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IProdutoRepository, ProdutoRepository>();
        services.AddHttpClient<IProdutoImagemStorage, MinioProdutoImagemStorage>(client =>
        {
            string endpoint = configuration["Minio:Endpoint"] ?? "http://localhost:9000";
            string bucket = configuration["Minio:Bucket"] ?? "produtos";
            client.BaseAddress = new Uri($"{endpoint.TrimEnd('/')}/{bucket.Trim('/')}/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });
        services.AddScoped<IUnitOfWork>(provider =>
            provider.GetRequiredService<PedidosDbContext>());

        return services;
    }
}
