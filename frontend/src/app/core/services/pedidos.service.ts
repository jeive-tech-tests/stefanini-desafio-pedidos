import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse, PedidosFiltro } from '../models/pedido.model';
import { ResultadoPaginado } from '../models/resultado-paginado.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/pedidos';

  listar(filtro: PedidosFiltro): Observable<ResultadoPaginado<PedidoResponse>> {
    let params = new HttpParams()
      .set('pagina', filtro.pagina)
      .set('tamanhoPagina', filtro.tamanhoPagina);

    if (filtro.nomeCliente) {
      params = params.set('nomeCliente', filtro.nomeCliente);
    }

    if (filtro.pago !== undefined) {
      params = params.set('pago', filtro.pago);
    }

    return this.http.get<ResultadoPaginado<PedidoResponse>>(this.url, { params });
  }

  obterPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.url}/${id}`);
  }

  criar(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.url, request);
  }

  atualizar(id: number, request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.url}/${id}`, request);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
