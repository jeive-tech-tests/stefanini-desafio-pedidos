using Stefanini.Pedidos.Domain.Exceptions;

namespace Stefanini.Pedidos.Domain.Entities;

public sealed class Produto
{
    private Produto()
    {
    }

    public Produto(string nomeProduto, decimal valor, string imagemObjeto = "produto-padrao.svg")
    {
        DefinirNome(nomeProduto);
        DefinirValor(valor);
        DefinirImagem(imagemObjeto);
    }

    public int Id { get; private set; }

    public string NomeProduto { get; private set; } = string.Empty;

    public decimal Valor { get; private set; }

    public string ImagemObjeto { get; private set; } = string.Empty;

    public void Atualizar(string nomeProduto, decimal valor, string? imagemObjeto = null)
    {
        DefinirNome(nomeProduto);
        DefinirValor(valor);

        if (imagemObjeto is not null)
        {
            DefinirImagem(imagemObjeto);
        }
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

    private void DefinirImagem(string imagemObjeto)
    {
        var nomeNormalizado = imagemObjeto?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(nomeNormalizado) || nomeNormalizado.Length > 100)
        {
            throw new DomainException("O objeto da imagem do produto deve possuir até 100 caracteres.");
        }

        ImagemObjeto = nomeNormalizado;
    }
}
