using System.Net.Mail;
using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.Domain.Entities;

public sealed class Pedido
{
    private readonly List<ItemPedido> _itensPedido = [];

    private Pedido()
    {
    }

    public Pedido(
        string nomeCliente,
        string emailCliente,
        bool pago,
        IEnumerable<ItemPedido> itensPedido,
        DateTime? dataCriacao = null)
    {
        DefinirCliente(nomeCliente, emailCliente);
        Pago = pago;
        DataCriacao = dataCriacao?.ToUniversalTime() ?? DateTime.UtcNow;
        SubstituirItens(itensPedido);
    }

    public int Id { get; private set; }

    public string NomeCliente { get; private set; } = string.Empty;

    public string EmailCliente { get; private set; } = string.Empty;

    public DateTime DataCriacao { get; private set; }

    public bool Pago { get; private set; }

    public IReadOnlyCollection<ItemPedido> ItensPedido => _itensPedido.AsReadOnly();

    public decimal ValorTotal => _itensPedido.Sum(item => item.Subtotal);

    public void Atualizar(
        string nomeCliente,
        string emailCliente,
        bool pago,
        IEnumerable<ItemPedido> itensPedido)
    {
        DefinirCliente(nomeCliente, emailCliente);
        Pago = pago;
        SubstituirItens(itensPedido);
    }

    private void DefinirCliente(string nomeCliente, string emailCliente)
    {
        var nomeNormalizado = nomeCliente?.Trim() ?? string.Empty;
        var emailNormalizado = emailCliente?.Trim().ToLowerInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(nomeNormalizado))
        {
            throw new DomainException("O nome do cliente é obrigatório.");
        }

        if (nomeNormalizado.Length > 60)
        {
            throw new DomainException("O nome do cliente deve ter no máximo 60 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(emailNormalizado) ||
            emailNormalizado.Length > 60 ||
            !MailAddress.TryCreate(emailNormalizado, out _))
        {
            throw new DomainException("O e-mail do cliente é inválido.");
        }

        NomeCliente = nomeNormalizado;
        EmailCliente = emailNormalizado;
    }

    private void SubstituirItens(IEnumerable<ItemPedido> itensPedido)
    {
        var itens = itensPedido?.ToList() ?? [];

        if (itens.Count == 0)
        {
            throw new DomainException("O pedido deve possuir ao menos um item.");
        }

        if (itens.GroupBy(item => item.ProdutoId).Any(grupo => grupo.Count() > 1))
        {
            throw new DomainException("Um produto não pode aparecer mais de uma vez no pedido.");
        }

        _itensPedido.Clear();
        _itensPedido.AddRange(itens);
    }
}
