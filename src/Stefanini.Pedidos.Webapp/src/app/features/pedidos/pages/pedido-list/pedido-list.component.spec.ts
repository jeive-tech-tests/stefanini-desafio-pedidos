import { Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { UiConfirmationService } from '../../../../shared/components/ui-confirm-dialog/ui-confirm-dialog.component';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoListComponent } from './pedido-list.component';

interface PedidoListHarness {
  pedidos: Signal<Pedido[]>;
  pagina: Signal<number>;
  tamanhoPagina: Signal<number>;
  totalItens: Signal<number>;
  valorTotalPagina: Signal<number>;
  pagosPagina: Signal<number>;
  pendentesPagina: Signal<number>;
  erro: Signal<string | null>;
  filtros: FormGroup;
  alterarPagina(evento: { page?: number; rows?: number }): void;
  remover(pedido: Pedido): void;
  totalUnidades(pedido: Pedido): number;
  percentual(quantidade: number): number;
  imagemProduto(idProduto: number): string;
}

const produto: Produto = {
  id: 1,
  nomeProduto: 'Notebook',
  valor: 100,
  imagemUrl: '/api/produtos/1/imagem',
};

const pedido: Pedido = {
  id: 42,
  nomeCliente: 'Cliente Teste',
  emailCliente: 'cliente@example.com',
  pago: true,
  valorTotal: 200,
  itensPedido: [
    {
      id: 1,
      idProduto: 1,
      nomeProduto: 'Notebook',
      valorUnitario: 100,
      quantidade: 2,
    },
  ],
};

describe('PedidoListComponent', () => {
  const listarPedidos = vi.fn();
  const removerPedido = vi.fn();
  const listarProdutos = vi.fn();
  const notificarSucesso = vi.fn();
  const confirmar = vi.fn();

  beforeEach(async () => {
    listarPedidos
      .mockReset()
      .mockReturnValue(
        of({ itens: [pedido], pagina: 1, tamanhoPagina: 8, totalItens: 1, totalPaginas: 1 }),
      );
    removerPedido.mockReset().mockReturnValue(of(undefined));
    listarProdutos.mockReset().mockReturnValue(of([produto]));
    notificarSucesso.mockReset();
    confirmar.mockReset();

    await TestBed.configureTestingModule({
      imports: [PedidoListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        ConfirmationService,
        { provide: PedidoService, useValue: { listar: listarPedidos, remover: removerPedido } },
        { provide: ProdutoService, useValue: { listar: listarProdutos } },
        { provide: NotificationService, useValue: { success: notificarSucesso } },
        { provide: UiConfirmationService, useValue: { confirm: confirmar } },
      ],
    }).compileComponents();
  });

  it('carrega pedidos, produtos e indicadores da página', () => {
    const fixture = TestBed.createComponent(PedidoListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoListHarness;

    expect(component.pedidos()).toEqual([pedido]);
    expect(component.totalItens()).toBe(1);
    expect(component.valorTotalPagina()).toBe(200);
    expect(component.pagosPagina()).toBe(1);
    expect(component.pendentesPagina()).toBe(0);
    expect(component.totalUnidades(pedido)).toBe(2);
    expect(component.percentual(1)).toBe(100);
    expect(component.imagemProduto(1)).toBe('/api/produtos/1/imagem');
  });

  it('recarrega ao alterar página ou tamanho', () => {
    const fixture = TestBed.createComponent(PedidoListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoListHarness;

    component.alterarPagina({ page: 1, rows: 20 });

    expect(component.pagina()).toBe(2);
    expect(component.tamanhoPagina()).toBe(20);
    expect(listarPedidos).toHaveBeenLastCalledWith({ pagina: 2, tamanhoPagina: 20 });
  });

  it('confirma, remove e recarrega um pedido', () => {
    const fixture = TestBed.createComponent(PedidoListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoListHarness;

    component.remover(pedido);
    const configuração = confirmar.mock.calls[0][0] as { accept: () => void };
    configuração.accept();

    expect(removerPedido).toHaveBeenCalledWith(42);
    expect(notificarSucesso).toHaveBeenCalledWith(
      'Pedido removido',
      'Pedido #42 removido com sucesso.',
    );
    expect(listarPedidos).toHaveBeenCalledTimes(2);
  });

  it('exibe a mensagem retornada pela API quando a listagem falha', () => {
    listarPedidos.mockReturnValue(
      throwError(() => ({ status: 500, error: { detail: 'Falha ao listar.' } })),
    );
    const fixture = TestBed.createComponent(PedidoListComponent);

    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as PedidoListHarness;
    expect(component.erro()).toContain('Tente novamente');
  });
});
