import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PedidoRequest, PedidoResponse } from '../models/pedido.model';
import { PedidosService } from './pedidos.service';

describe('PedidosService', () => {
  let service: PedidosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PedidosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should send pagination and filters when listing orders', () => {
    service
      .listar({ pagina: 2, tamanhoPagina: 8, nomeCliente: 'Maria', pago: false })
      .subscribe((resultado) => expect(resultado.totalItens).toBe(0));

    const request = http.expectOne(
      (req) =>
        req.url === '/api/pedidos' &&
        req.params.get('pagina') === '2' &&
        req.params.get('tamanhoPagina') === '8' &&
        req.params.get('nomeCliente') === 'Maria' &&
        req.params.get('pago') === 'false',
    );

    expect(request.request.method).toBe('GET');
    request.flush({ itens: [], pagina: 2, tamanhoPagina: 8, totalItens: 0, totalPaginas: 0 });
  });

  it('should post the order payload', () => {
    const payload: PedidoRequest = {
      nomeCliente: 'Maria',
      emailCliente: 'maria@example.com',
      pago: false,
      itensPedido: [{ idProduto: 1, quantidade: 2 }],
    };
    const response: PedidoResponse = {
      id: 10,
      ...payload,
      valorTotal: 20,
      itensPedido: [
        {
          id: 1,
          idProduto: 1,
          nomeProduto: 'Produto',
          valorUnitario: 10,
          quantidade: 2,
        },
      ],
    };

    service.criar(payload).subscribe((pedido) => expect(pedido.id).toBe(10));

    const request = http.expectOne('/api/pedidos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(response);
  });
});
