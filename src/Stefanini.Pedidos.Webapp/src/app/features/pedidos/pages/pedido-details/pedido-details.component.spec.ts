import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoDetailsComponent } from './pedido-details.component';

interface PedidoDetailsHarness {
  pedido: Signal<Pedido | null>;
  produtos: Signal<Produto[]>;
  carregando: Signal<boolean>;
  imagemProduto(idProduto: number): string;
}

describe('PedidoDetailsComponent', () => {
  const produto: Produto = {
    id: 1,
    nomeProduto: 'Notebook',
    valor: 100,
    imagemUrl: '/api/produtos/1/imagem',
  };
  const pedido: Pedido = {
    id: 42,
    nomeCliente: 'Cliente',
    emailCliente: 'cliente@example.com',
    pago: true,
    valorTotal: 200,
    itensPedido: [
      {
        id: 10,
        idProduto: 1,
        nomeProduto: 'Notebook',
        valorUnitario: 100,
        quantidade: 2,
      },
    ],
  };
  const obterPorId = vi.fn();

  beforeEach(async () => {
    obterPorId.mockReset().mockReturnValue(of(pedido));
    await TestBed.configureTestingModule({
      imports: [PedidoDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } },
        },
        { provide: PedidoService, useValue: { obterPorId } },
        { provide: ProdutoService, useValue: { listar: () => of([produto]) } },
      ],
    }).compileComponents();
  });

  it('carrega e apresenta os dados completos do pedido', () => {
    const fixture = TestBed.createComponent(PedidoDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoDetailsHarness;

    expect(obterPorId).toHaveBeenCalledWith(42);
    expect(component.pedido()).toBe(pedido);
    expect(component.produtos()).toEqual([produto]);
    expect(component.carregando()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Cliente');
    expect(fixture.nativeElement.textContent).toContain('Notebook');
  });

  it('resolve a imagem do produto e usa vazio como fallback', () => {
    const fixture = TestBed.createComponent(PedidoDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoDetailsHarness;

    expect(component.imagemProduto(1)).toBe('/api/produtos/1/imagem');
    expect(component.imagemProduto(999)).toBe('');
  });
});
