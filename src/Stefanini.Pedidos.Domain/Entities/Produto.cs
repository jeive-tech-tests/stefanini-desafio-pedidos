using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.Domain.Entities;

public sealed class Produto
{
    private Produto()
    {
    }

    public Produto(string nomeProduto, decimal valor)
    {
        DefinirNome(nomeProduto);
        DefinirValor(valor);
    }

    public int Id { get; private set; }

    public string NomeProduto { get; private set; } = string.Empty;

    public decimal Valor { get; private set; }

    public void Atualizar(string nomeProduto, decimal valor)
    {
        DefinirNome(nomeProduto);
        DefinirValor(valor);
    }

    private void DefinirNome(string nomeProduto)
    {
        var nomeNormalizado = nomeProduto?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(nomeNormalizado))
        {
            throw new DomainException("O nome do produto é obrigatório.");
        }

        if (nomeNormalizado.Length > 20)
        {
            throw new DomainException("O nome do produto deve ter no máximo 20 caracteres.");
        }

        NomeProduto = nomeNormalizado;
    }

    private void DefinirValor(decimal valor)
    {
        if (valor <= 0)
        {
            throw new DomainException("O valor do produto deve ser maior que zero.");
        }

        Valor = decimal.Round(valor, 2, MidpointRounding.AwayFromZero);
    }
}
