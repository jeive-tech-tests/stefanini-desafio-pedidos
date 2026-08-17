using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stefanini.Pedidos.Domain.Entities;

namespace Stefanini.Pedidos.Infrastructure.Persistence.Configurations;

internal sealed class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("Produtos");

        builder.HasKey(produto => produto.Id);
        builder.Property(produto => produto.Id).ValueGeneratedOnAdd();

        builder.Property(produto => produto.NomeProduto)
            .HasColumnType("varchar(20)")
            .HasMaxLength(20)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(produto => produto.Valor)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(produto => produto.ImagemObjeto)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasData(
            new { Id = 1, NomeProduto = "Notebook", Valor = 4299.90m, ImagemObjeto = "notebook.svg" },
            new { Id = 2, NomeProduto = "Monitor", Valor = 1199.90m, ImagemObjeto = "monitor.svg" },
            new { Id = 3, NomeProduto = "Teclado", Valor = 249.90m, ImagemObjeto = "teclado.svg" },
            new { Id = 4, NomeProduto = "Mouse", Valor = 129.90m, ImagemObjeto = "mouse.svg" },
            new { Id = 5, NomeProduto = "Headset", Valor = 399.90m, ImagemObjeto = "headset.svg" });
    }
}
