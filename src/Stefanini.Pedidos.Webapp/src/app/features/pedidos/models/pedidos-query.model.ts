export interface PedidosQuery {
  pagina: number;
  tamanhoPagina: number;
  nomeCliente?: string;
  idProduto?: number;
  pago?: boolean;
}
