import { PedidoItem } from './pedido-item.model';

export interface Pedido {
  id: number;
  nomeCliente: string;
  emailCliente: string;
  pago: boolean;
  valorTotal: number;
  itensPedido: PedidoItem[];
}
