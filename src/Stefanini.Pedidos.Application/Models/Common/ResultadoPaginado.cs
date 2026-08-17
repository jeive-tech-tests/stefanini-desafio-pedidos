namespace Stefanini.Pedidos.Application.Models.Common;

public sealed record ResultadoPaginado<T>(
    IReadOnlyCollection<T> Itens,
    int Pagina,
    int TamanhoPagina,
    int TotalItens,
    int TotalPaginas);
