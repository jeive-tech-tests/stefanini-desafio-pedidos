using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Infrastructure.Persistence.Configurations;

internal sealed class ItemPedidoConfiguration : IEntityTypeConfiguration<ItemPedido>
{
    public void Configure(EntityTypeBuilder<ItemPedido> builder)
    {
        builder.ToTable("ItensPedido");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedOnAdd();

        builder.Property(item => item.ValorUnitario)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(item => item.PedidoId)
            .HasColumnName("IdPedido");

        builder.Property(item => item.ProdutoId)
            .HasColumnName("IdProduto");

        builder.Property(item => item.Quantidade).IsRequired();
        builder.Ignore(item => item.Subtotal);

        builder.HasOne(item => item.Produto)
            .WithMany()
            .HasForeignKey(item => item.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(item => new { item.PedidoId, item.ProdutoId })
            .IsUnique();
    }
}
