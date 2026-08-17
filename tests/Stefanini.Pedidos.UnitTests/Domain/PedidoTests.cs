using Stefanini.Pedidos.Domain.Entities;
using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.UnitTests.Domain;

public sealed class PedidoTests
{
    [Fact]
    public void CriarPedido_DeveNormalizarClienteECalcularTotal()
    {
        var produto = new Produto("Produto", 12.50m);
        var criadoEm = new DateTime(2026, 8, 17, 10, 0, 0, DateTimeKind.Local);

        var pedido = new Pedido(
            "  Cliente Teste  ",
            "  CLIENTE@EXAMPLE.COM  ",
            true,
            [new ItemPedido(produto, 2)],
            criadoEm);

        Assert.Equal("Cliente Teste", pedido.NomeCliente);
        Assert.Equal("cliente@example.com", pedido.EmailCliente);
        Assert.True(pedido.Pago);
        Assert.Equal(25.00m, pedido.ValorTotal);
        Assert.Equal(DateTimeKind.Utc, pedido.DataCriacao.Kind);
    }

    [Fact]
    public void CriarPedido_SemItens_DeveRejeitar()
    {
        DomainException excecao = Assert.Throws<DomainException>(() =>
            new Pedido("Cliente", "cliente@example.com", false, []));

        Assert.Contains("ao menos um item", excecao.Message);
    }

    [Fact]
    public void CriarPedido_ComProdutoDuplicado_DeveRejeitar()
    {
        var produto = new Produto("Produto", 10m);

        DomainException excecao = Assert.Throws<DomainException>(() =>
            new Pedido(
                "Cliente",
                "cliente@example.com",
                false,
                [new ItemPedido(produto, 1), new ItemPedido(produto, 2)]));

        Assert.Contains("mais de uma vez", excecao.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void CriarPedido_ComNomeVazio_DeveRejeitar(string nome)
    {
        var produto = new Produto("Produto", 10m);

        Assert.Throws<DomainException>(() =>
            new Pedido(nome, "cliente@example.com", false, [new ItemPedido(produto, 1)]));
    }

    [Theory]
    [InlineData("")]
    [InlineData("email-invalido")]
    [InlineData("cliente@")]
    public void CriarPedido_ComEmailInvalido_DeveRejeitar(string email)
    {
        var produto = new Produto("Produto", 10m);

        Assert.Throws<DomainException>(() =>
            new Pedido("Cliente", email, false, [new ItemPedido(produto, 1)]));
    }
}
