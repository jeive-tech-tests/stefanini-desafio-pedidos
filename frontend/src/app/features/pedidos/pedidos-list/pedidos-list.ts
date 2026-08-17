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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, finalize } from 'rxjs';
import { PedidoResponse, PedidosFiltro } from '../../../core/models/pedido.model';
import { PedidosService } from '../../../core/services/pedidos.service';
import { mensagemErroHttp } from '../../../core/utils/http-error';

type StatusFiltro = 'todos' | 'pago' | 'pendente';

@Component({
  selector: 'app-pedidos-list',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    CurrencyPipe,
    InputTextModule,
    MessageModule,
    PaginatorModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './pedidos-list.html',
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosList implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly pedidos = signal<PedidoResponse[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal<string | null>(null);
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
    const mensagem = this.route.snapshot.queryParamMap.get('sucesso');
    if (mensagem) {
      this.sucesso.set(mensagem);
    }

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
    const filtro: PedidosFiltro = {
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

  protected alterarPagina(evento: PaginatorState): void {
    const novaPagina = (evento.page ?? 0) + 1;
    const novoTamanho = evento.rows ?? this.tamanhoPagina();

    if (novaPagina === this.pagina() && novoTamanho === this.tamanhoPagina()) {
      return;
    }

    this.pagina.set(novaPagina);
    this.tamanhoPagina.set(novoTamanho);
    this.carregar();
  }

  protected remover(pedido: PedidoResponse): void {
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

  protected totalUnidades(pedido: PedidoResponse): number {
    return pedido.itensPedido.reduce((total, item) => total + item.quantidade, 0);
  }

  protected percentual(quantidade: number): number {
    return this.pedidos().length === 0 ? 0 : Math.round((quantidade / this.pedidos().length) * 100);
  }

  private executarRemocao(pedido: PedidoResponse): void {
    this.removendoId.set(pedido.id);
    this.erro.set(null);
    this.sucesso.set(null);

    this.pedidosService
      .remover(pedido.id)
      .pipe(
        finalize(() => this.removendoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.sucesso.set(`Pedido #${pedido.id} removido com sucesso.`);
          if (this.pedidos().length === 1 && this.pagina() > 1) {
            this.pagina.update((pagina) => pagina - 1);
          }
          this.carregar();
        },
        error: (error: unknown) => this.erro.set(mensagemErroHttp(error)),
      });
  }
}
