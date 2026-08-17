using Microsoft.Extensions.DependencyInjection;
using Stefanini.Pedidos.Application.Abstractions.Services;
using Stefanini.Pedidos.Application.Services;

namespace Stefanini.Pedidos.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IPedidoService, PedidoService>();
        services.AddScoped<IProdutoService, ProdutoService>();

        return services;
    }
}
