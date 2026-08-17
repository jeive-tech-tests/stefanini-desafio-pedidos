using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Stefanini.Pedidos.Infrastructure.Persistence;

public sealed class PedidosDbContextFactory : IDesignTimeDbContextFactory<PedidosDbContext>
{
    public PedidosDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__PedidosDb")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=StefaniniPedidos;Trusted_Connection=True;" +
               "MultipleActiveResultSets=true;TrustServerCertificate=True";

        var options = new DbContextOptionsBuilder<PedidosDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new PedidosDbContext(options);
    }
}
