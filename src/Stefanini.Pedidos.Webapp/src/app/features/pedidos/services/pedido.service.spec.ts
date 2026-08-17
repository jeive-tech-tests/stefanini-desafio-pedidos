import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreatePedido } from '../models/create-pedido.model';
import { UpdatePedido } from '../models/update-pedido.model';
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
  it('consulta o sumário global em endpoint independente', () => {
    service.obterSumario().subscribe();

    const request = http.expectOne('/api/pedidos/sumario');

    expect(request.request.method).toBe('GET');
    request.flush({ totalPedidos: 50, valorTotal: 1000, pedidosPagos: 30, pedidosPendentes: 20 });
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

  it('não envia filtros opcionais vazios', () => {
    service.listar({ pagina: 1, tamanhoPagina: 10 }).subscribe();

    const request = http.expectOne('/api/pedidos?pagina=1&tamanhoPagina=10');

    expect(request.request.params.has('nomeCliente')).toBe(false);
    expect(request.request.params.has('pago')).toBe(false);
    request.flush({ itens: [], pagina: 1, tamanhoPagina: 10, totalItens: 0, totalPaginas: 0 });
  });

  it('consulta um pedido pelo identificador', () => {
    service.obterPorId(42).subscribe();

    const request = http.expectOne('/api/pedidos/42');

    expect(request.request.method).toBe('GET');
    request.flush({
      id: 42,
      nomeCliente: 'Maria',
      emailCliente: 'maria@example.com',
      pago: false,
      valorTotal: 20,
      itensPedido: [],
    });
  });

  it('envia as alterações do pedido', () => {
    const payload: UpdatePedido = {
      nomeCliente: 'Maria Atualizada',
      emailCliente: 'maria@example.com',
      pago: true,
      itensPedido: [{ idProduto: 2, quantidade: 3 }],
    };

    service.atualizar(42, payload).subscribe();
    const request = http.expectOne('/api/pedidos/42');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 42, ...payload, valorTotal: 60, itensPedido: [] });
  });

  it('remove um pedido pelo identificador', () => {
    service.remover(42).subscribe();

    const request = http.expectOne('/api/pedidos/42');

    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
