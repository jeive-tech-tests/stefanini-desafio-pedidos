using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Infrastructure.Persistence.Configurations;

internal sealed class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> builder)
    {
        builder.ToTable("Pedidos");

        builder.HasKey(pedido => pedido.Id);
        builder.Property(pedido => pedido.Id).ValueGeneratedOnAdd();

        builder.Property(pedido => pedido.NomeCliente)
            .HasColumnType("varchar(60)")
            .HasMaxLength(60)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(pedido => pedido.EmailCliente)
            .HasColumnType("varchar(60)")
            .HasMaxLength(60)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(pedido => pedido.DataCriacao)
            .HasColumnType("datetime")
            .IsRequired();

        builder.Property(pedido => pedido.Pago)
            .HasColumnType("bit")
            .IsRequired();

        builder.Ignore(pedido => pedido.ValorTotal);

        builder.HasMany(pedido => pedido.ItensPedido)
            .WithOne(item => item.Pedido)
            .HasForeignKey(item => item.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(pedido => pedido.ItensPedido)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
