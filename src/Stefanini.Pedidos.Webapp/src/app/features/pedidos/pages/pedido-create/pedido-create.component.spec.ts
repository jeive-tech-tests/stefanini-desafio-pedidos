import { Signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { UiConfirmationService } from '../../../../shared/components/ui-confirm-dialog/ui-confirm-dialog.component';
import { CreatePedido } from '../../models/create-pedido.model';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoCreateComponent } from './pedido-create.component';

interface PedidoCreateHarness {
  produtos: Signal<Produto[]>;
  carregando: Signal<boolean>;
  salvando: Signal<boolean>;
  salvar(request: CreatePedido): void;
  cancelar(): void;
}

describe('PedidoCreateComponent', () => {
  const produto: Produto = {
    id: 1,
    nomeProduto: 'Notebook',
    valor: 100,
    imagemUrl: '/notebook.svg',
  };
  const payload: CreatePedido = {
    nomeCliente: 'Cliente',
    emailCliente: 'cliente@example.com',
    pago: false,
    itensPedido: [{ idProduto: 1, quantidade: 2 }],
  };
  const criado: Pedido = {
    id: 42,
    ...payload,
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
  const criar = vi.fn();
  const notificar = vi.fn();

  beforeEach(async () => {
    criar.mockReset().mockReturnValue(of(criado));
    notificar.mockReset();
    await TestBed.configureTestingModule({
      imports: [PedidoCreateComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        ConfirmationService,
        {
          provide: PedidoService,
          useValue: {
            criar,
            listar: () =>
              of({ itens: [], pagina: 1, tamanhoPagina: 8, totalItens: 0, totalPaginas: 0 }),
          },
        },
        { provide: ProdutoService, useValue: { listar: () => of([produto]) } },
        { provide: NotificationService, useValue: { success: notificar } },
        { provide: UiConfirmationService, useValue: { confirm: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('carrega produtos para o formulário', () => {
    const fixture = TestBed.createComponent(PedidoCreateComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoCreateHarness;

    expect(component.produtos()).toEqual([produto]);
    expect(component.carregando()).toBe(false);
  });

  it('cria, notifica e navega para o pedido', () => {
    const fixture = TestBed.createComponent(PedidoCreateComponent);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoCreateHarness;

    component.salvar(payload);

    expect(criar).toHaveBeenCalledWith(payload);
    expect(component.salvando()).toBe(false);
    expect(notificar).toHaveBeenCalledWith('Pedido criado', 'Pedido #42 criado com sucesso.');
    expect(navegar).toHaveBeenCalledWith(['/pedidos', 42]);
  });

  it('cancela retornando para a listagem', () => {
    const fixture = TestBed.createComponent(PedidoCreateComponent);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as PedidoCreateHarness).cancelar();

    expect(navegar).toHaveBeenCalledWith(['/pedidos']);
  });
});
