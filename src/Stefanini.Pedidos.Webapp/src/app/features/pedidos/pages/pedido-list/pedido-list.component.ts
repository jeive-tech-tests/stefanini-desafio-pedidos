import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, finalize } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { mensagemErroHttp } from '../../../../shared/utils/http-error';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { UiLoadingComponent } from '../../../../shared/components/ui-loading/ui-loading.component';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import {
  UiPageChange,
  UiTableComponent,
} from '../../../../shared/components/ui-table/ui-table.component';
import { UiProductImageComponent } from '../../../../shared/components/ui-product-image/ui-product-image.component';
import {
  UiConfirmDialogComponent,
  UiConfirmationService,
} from '../../../../shared/components/ui-confirm-dialog/ui-confirm-dialog.component';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '../../../../shared/components/ui-select/ui-select.component';
import { UiTagComponent } from '../../../../shared/components/ui-tag/ui-tag.component';
import { Pedido } from '../../models/pedido.model';
import { PedidosQuery } from '../../models/pedidos-query.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';

type StatusFiltro = 'todos' | 'pago' | 'pendente';

@Component({
  selector: 'app-pedido-list',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
    UiLoadingComponent,
    UiButtonComponent,
    UiCardComponent,
    UiConfirmDialogComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTableComponent,
    UiProductImageComponent,
    UiTagComponent,
  ],
  templateUrl: './pedido-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoListComponent implements OnInit {
  private readonly pedidosService = inject(PedidoService);
  private readonly produtosService = inject(ProdutoService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(UiConfirmationService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly removendoId = signal<number | null>(null);
  protected readonly pagina = signal(1);
  protected readonly tamanhoPagina = signal(8);
  protected readonly totalItens = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly valorTotalPagina = computed(() =>
    this.pedidos().reduce((total, pedido) => total + pedido.valorTotal, 0),
  );
  protected readonly pagosPagina = computed(
    () => this.pedidos().filter((pedido) => pedido.pago).length,
  );
  protected readonly pendentesPagina = computed(
    () => this.pedidos().filter((pedido) => !pedido.pago).length,
  );

  protected readonly statusOpcoes = [
    { label: 'Todos os status', value: 'todos' as const },
    { label: 'Pagos', value: 'pago' as const },
    { label: 'Pendentes', value: 'pendente' as const },
  ];

  protected readonly filtros = new FormGroup({
    nomeCliente: new FormControl('', { nonNullable: true }),
    status: new FormControl<StatusFiltro>('todos', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.produtosService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (produtos) => this.produtos.set(produtos),
        error: () => undefined,
      });

    this.filtros.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina.set(1);
        this.carregar();
      });

    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    const status = this.filtros.controls.status.value;
    const nomeCliente = this.filtros.controls.nomeCliente.value.trim();
    const filtro: PedidosQuery = {
      pagina: this.pagina(),
      tamanhoPagina: this.tamanhoPagina(),
      ...(nomeCliente ? { nomeCliente } : {}),
      ...(status !== 'todos' ? { pago: status === 'pago' } : {}),
    };

    this.pedidosService
      .listar(filtro)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.pedidos.set(resultado.itens);
          this.totalItens.set(resultado.totalItens);
          this.totalPaginas.set(resultado.totalPaginas);
        },
        error: (error: unknown) => this.erro.set(mensagemErroHttp(error)),
      });
  }

  protected limparFiltros(): void {
    this.filtros.setValue({ nomeCliente: '', status: 'todos' });
  }

  protected alterarPagina(evento: UiPageChange): void {
    const novaPagina = (evento.page ?? 0) + 1;
    const novoTamanho = evento.rows ?? this.tamanhoPagina();

    if (novaPagina === this.pagina() && novoTamanho === this.tamanhoPagina()) {
      return;
    }

    this.pagina.set(novaPagina);
    this.tamanhoPagina.set(novoTamanho);
    this.carregar();
  }

  protected remover(pedido: Pedido): void {
    this.confirmationService.confirm({
      header: 'Excluir pedido',
      message: `Deseja realmente excluir o pedido #${pedido.id} de ${pedido.nomeCliente}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.executarRemocao(pedido),
    });
  }

  protected totalUnidades(pedido: Pedido): number {
    return pedido.itensPedido.reduce((total, item) => total + item.quantidade, 0);
  }

  protected percentual(quantidade: number): number {
    return this.pedidos().length === 0 ? 0 : Math.round((quantidade / this.pedidos().length) * 100);
  }

  protected imagemProduto(idProduto: number): string {
    return this.produtos().find((produto) => produto.id === idProduto)?.imagemUrl ?? '';
  }

  private executarRemocao(pedido: Pedido): void {
    this.removendoId.set(pedido.id);
    this.erro.set(null);

    this.pedidosService
      .remover(pedido.id)
      .pipe(
        finalize(() => this.removendoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notifications.success(
            'Pedido removido',
            `Pedido #${pedido.id} removido com sucesso.`,
          );
          if (this.pedidos().length === 1 && this.pagina() > 1) {
            this.pagina.update((pagina) => pagina - 1);
          }
          this.carregar();
        },
        error: (error: unknown) => this.erro.set(mensagemErroHttp(error)),
      });
  }
}
