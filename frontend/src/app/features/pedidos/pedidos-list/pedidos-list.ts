import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, finalize } from 'rxjs';
import { PedidoResponse, PedidosFiltro } from '../../../core/models/pedido.model';
import { PedidosService } from '../../../core/services/pedidos.service';
import { mensagemErroHttp } from '../../../core/utils/http-error';

type StatusFiltro = 'todos' | 'pago' | 'pendente';

@Component({
  selector: 'app-pedidos-list',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './pedidos-list.html',
  styleUrl: './pedidos-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosList implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pedidos = signal<PedidoResponse[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal<string | null>(null);
  protected readonly removendoId = signal<number | null>(null);
  protected readonly pagina = signal(1);
  protected readonly tamanhoPagina = 8;
  protected readonly totalItens = signal(0);
  protected readonly totalPaginas = signal(0);

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
      tamanhoPagina: this.tamanhoPagina,
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

  protected irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina()) {
      return;
    }

    this.pagina.set(pagina);
    this.carregar();
  }

  protected remover(pedido: PedidoResponse): void {
    const confirmou = window.confirm(
      `Deseja realmente excluir o pedido #${pedido.id} de ${pedido.nomeCliente}?`,
    );

    if (!confirmou) {
      return;
    }

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
