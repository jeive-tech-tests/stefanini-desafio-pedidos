export interface ItemPedidoResponse {
  id: number;
  idProduto: number;
  nomeProduto: string;
  valorUnitario: number;
  quantidade: number;
}

export interface PedidoResponse {
  id: number;
  nomeCliente: string;
  emailCliente: string;
  pago: boolean;
  valorTotal: number;
  itensPedido: ItemPedidoResponse[];
}

export interface ItemPedidoRequest {
  idProduto: number;
  quantidade: number;
}

export interface PedidoRequest {
  nomeCliente: string;
  emailCliente: string;
  pago: boolean;
  itensPedido: ItemPedidoRequest[];
}

export interface PedidosFiltro {
  pagina: number;
  tamanhoPagina: number;
  nomeCliente?: string;
  pago?: boolean;
}
