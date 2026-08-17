import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiEndpoint } from '../../../core/config/api.config';
import { CreatePedido } from '../models/create-pedido.model';
import { Pedido } from '../models/pedido.model';
import { PedidosQuery } from '../models/pedidos-query.model';
import { ResultadoPaginado } from '../models/resultado-paginado.model';
import { SumarioPedidos } from '../models/sumario-pedidos.model';
import { UpdatePedido } from '../models/update-pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = apiEndpoint('pedidos');

  listar(query: PedidosQuery): Observable<ResultadoPaginado<Pedido>> {
    let params = new HttpParams()
      .set('pagina', query.pagina)
      .set('tamanhoPagina', query.tamanhoPagina);

    if (query.nomeCliente) params = params.set('nomeCliente', query.nomeCliente);
    if (query.idProduto !== undefined) params = params.set('idProduto', query.idProduto);
    if (query.pago !== undefined) params = params.set('pago', query.pago);

    return this.http.get<ResultadoPaginado<Pedido>>(this.url, { params });
  }

  obterSumario(): Observable<SumarioPedidos> {
    return this.http.get<SumarioPedidos>(`${this.url}/sumario`);
  }

  obterPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.url}/${id}`);
  }

  criar(request: CreatePedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.url, request);
  }

  atualizar(id: number, request: UpdatePedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.url}/${id}`, request);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
