import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProdutoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista produtos e monta a URL da imagem pela API', () => {
    const recebido = vi.fn();
    service.listar().subscribe(recebido);

    const request = http.expectOne('/api/produtos');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, nomeProduto: 'Notebook', valor: 4299.9 }]);

    expect(recebido).toHaveBeenCalledWith([
      {
        id: 1,
        nomeProduto: 'Notebook',
        valor: 4299.9,
        imagemUrl: '/api/produtos/1/imagem',
      },
    ]);
  });
});
