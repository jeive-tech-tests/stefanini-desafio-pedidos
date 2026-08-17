import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoResponse } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>('/api/produtos');
  }
}
