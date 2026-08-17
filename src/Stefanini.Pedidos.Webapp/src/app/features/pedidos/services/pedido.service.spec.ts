import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreatePedido } from '../models/create-pedido.model';
import { PedidoService } from './pedido.service';

describe('PedidoService', () => {
  let service: PedidoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PedidoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('envia paginação e filtros na listagem', () => {
    service.listar({ pagina: 2, tamanhoPagina: 8, nomeCliente: 'Maria', pago: false }).subscribe();
    const request = http.expectOne(
      (req) =>
        req.url === '/api/pedidos' &&
        req.params.get('pagina') === '2' &&
        req.params.get('pago') === 'false',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ itens: [], pagina: 2, tamanhoPagina: 8, totalItens: 0, totalPaginas: 0 });
  });
  it('envia o pedido para criação', () => {
    const payload: CreatePedido = {
      nomeCliente: 'Maria',
      emailCliente: 'maria@example.com',
      pago: false,
      itensPedido: [{ idProduto: 1, quantidade: 2 }],
    };
    service.criar(payload).subscribe();
    const request = http.expectOne('/api/pedidos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 10, ...payload, valorTotal: 20, itensPedido: [] });
  });
});
