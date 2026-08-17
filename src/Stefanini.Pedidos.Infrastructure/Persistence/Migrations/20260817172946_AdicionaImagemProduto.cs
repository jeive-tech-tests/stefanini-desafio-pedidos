using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stefanini.Pedidos.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaImagemProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagemObjeto",
                table: "Produtos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Produtos",
                keyColumn: "Id",
                keyValue: 1,
                column: "ImagemObjeto",
                value: "notebook.svg");

            migrationBuilder.UpdateData(
                table: "Produtos",
                keyColumn: "Id",
                keyValue: 2,
                column: "ImagemObjeto",
                value: "monitor.svg");

            migrationBuilder.UpdateData(
                table: "Produtos",
                keyColumn: "Id",
                keyValue: 3,
                column: "ImagemObjeto",
                value: "teclado.svg");

            migrationBuilder.UpdateData(
                table: "Produtos",
                keyColumn: "Id",
                keyValue: 4,
                column: "ImagemObjeto",
                value: "mouse.svg");

            migrationBuilder.UpdateData(
                table: "Produtos",
                keyColumn: "Id",
                keyValue: 5,
                column: "ImagemObjeto",
                value: "headset.svg");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagemObjeto",
                table: "Produtos");
        }
    }
}
