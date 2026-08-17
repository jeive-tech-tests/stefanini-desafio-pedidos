import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiEndpoint } from '../../../core/config/api.config';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(apiEndpoint('produtos'));
  }
}
