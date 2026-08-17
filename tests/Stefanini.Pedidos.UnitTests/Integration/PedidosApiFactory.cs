using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Stefanini.Pedidos.Application.Abstractions.Storage;
using Stefanini.Pedidos.Application.Models.Produtos;
using Stefanini.Pedidos.Infrastructure.Persistence;

namespace Stefanini.Pedidos.UnitTests.Integration;

public sealed class PedidosApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"pedidos-tests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) =>
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:ApplyMigrationsOnStartup"] = "false",
                ["Hosting:PathBase"] = string.Empty
            }));

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<PedidosDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<PedidosDbContext>>();
            services.RemoveAll<PedidosDbContext>();
            services.AddDbContext<PedidosDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
            services.RemoveAll<IProdutoImagemStorage>();
            services.AddSingleton<IProdutoImagemStorage, ProdutoImagemStorageFake>();
        });
    }

    public void GarantirBancoCriado()
    {
        using IServiceScope scope = Services.CreateScope();
        PedidosDbContext context = scope.ServiceProvider.GetRequiredService<PedidosDbContext>();
        context.Database.EnsureCreated();
    }

    private sealed class ProdutoImagemStorageFake : IProdutoImagemStorage
    {
        public Task<ProdutoImagemResponse?> ObterAsync(
            string objeto,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<ProdutoImagemResponse?>(
                new ProdutoImagemResponse([1, 2, 3], "image/svg+xml"));
        }
    }
}
