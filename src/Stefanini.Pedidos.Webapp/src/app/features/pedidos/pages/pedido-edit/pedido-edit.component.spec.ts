import { Signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { UpdatePedido } from '../../models/update-pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoEditComponent } from './pedido-edit.component';

interface PedidoEditHarness {
  pedido: Signal<Pedido | null>;
  produtos: Signal<Produto[]>;
  carregando: Signal<boolean>;
  salvando: Signal<boolean>;
  salvar(request: UpdatePedido): void;
  cancelar(): void;
}

describe('PedidoEditComponent', () => {
  const produto: Produto = {
    id: 1,
    nomeProduto: 'Notebook',
    valor: 100,
    imagemUrl: '/notebook.svg',
  };
  const pedido: Pedido = {
    id: 42,
    nomeCliente: 'Cliente',
    emailCliente: 'cliente@example.com',
    pago: false,
    valorTotal: 100,
    itensPedido: [
      {
        id: 10,
        idProduto: 1,
        nomeProduto: 'Notebook',
        valorUnitario: 100,
        quantidade: 1,
      },
    ],
  };
  const obterPorId = vi.fn();
  const atualizar = vi.fn();
  const notificar = vi.fn();

  beforeEach(async () => {
    obterPorId.mockReset().mockReturnValue(of(pedido));
    atualizar.mockReset().mockReturnValue(of({ ...pedido, nomeCliente: 'Atualizado', pago: true }));
    notificar.mockReset();
    await TestBed.configureTestingModule({
      imports: [PedidoEditComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } },
        },
        { provide: PedidoService, useValue: { obterPorId, atualizar } },
        { provide: ProdutoService, useValue: { listar: () => of([produto]) } },
        { provide: NotificationService, useValue: { success: notificar } },
      ],
    }).compileComponents();
  });

  it('carrega pedido e produtos pelo identificador da rota', () => {
    const fixture = TestBed.createComponent(PedidoEditComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoEditHarness;

    expect(obterPorId).toHaveBeenCalledWith(42);
    expect(component.pedido()).toBe(pedido);
    expect(component.produtos()).toEqual([produto]);
    expect(component.carregando()).toBe(false);
  });

  it('atualiza, notifica e navega para os detalhes', () => {
    const fixture = TestBed.createComponent(PedidoEditComponent);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const request: UpdatePedido = {
      nomeCliente: 'Atualizado',
      emailCliente: 'cliente@example.com',
      pago: true,
      itensPedido: [{ idProduto: 1, quantidade: 1 }],
    };

    (fixture.componentInstance as unknown as PedidoEditHarness).salvar(request);

    expect(atualizar).toHaveBeenCalledWith(42, request);
    expect(notificar).toHaveBeenCalledWith(
      'Pedido atualizado',
      'Pedido #42 atualizado com sucesso.',
    );
    expect(navegar).toHaveBeenCalledWith(['/pedidos', 42]);
  });

  it('cancela retornando aos detalhes', () => {
    const fixture = TestBed.createComponent(PedidoEditComponent);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as PedidoEditHarness).cancelar();

    expect(navegar).toHaveBeenCalledWith(['/pedidos', 42]);
  });
});
