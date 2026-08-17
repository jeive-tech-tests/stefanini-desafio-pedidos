export interface PedidosQuery {
  pagina: number;
  tamanhoPagina: number;
  nomeCliente?: string;
  pago?: boolean;
}
