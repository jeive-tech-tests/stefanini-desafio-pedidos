export interface CreatePedidoItem {
  idProduto: number;
  quantidade: number;
}

export interface CreatePedido {
  nomeCliente: string;
  emailCliente: string;
  pago: boolean;
  itensPedido: CreatePedidoItem[];
}
