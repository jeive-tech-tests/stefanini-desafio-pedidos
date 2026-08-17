using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stefanini.Pedidos.Infrastructure.Persistence;

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

        return services;
    }
}
