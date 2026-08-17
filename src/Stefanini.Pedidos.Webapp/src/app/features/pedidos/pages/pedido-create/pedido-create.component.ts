import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UiLoadingComponent } from '../../../../shared/components/ui-loading/ui-loading.component';
import { UiModalComponent } from '../../../../shared/components/ui-modal/ui-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { PedidoFormComponent } from '../../components/pedido-form/pedido-form.component';
import { CreatePedido } from '../../models/create-pedido.model';
import { Produto } from '../../models/produto.model';
import { PedidoService } from '../../services/pedido.service';
import { PedidoListRefreshService } from '../../services/pedido-list-refresh.service';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-pedido-create',
  imports: [PedidoFormComponent, UiLoadingComponent, UiModalComponent],
  templateUrl: './pedido-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoCreateComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly listRefresh = inject(PedidoListRefreshService);
  private readonly produtoService = inject(ProdutoService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  ngOnInit(): void {
    this.produtoService
      .listar()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => this.produtos.set(products),
        error: () => undefined,
      });
  }
  protected salvar(request: CreatePedido): void {
    this.salvando.set(true);
    this.pedidoService
      .criar(request)
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pedido) => {
          this.notifications.success('Pedido criado', `Pedido #${pedido.id} criado com sucesso.`);
          this.listRefresh.requestRefresh();
          void this.router.navigate(['/pedidos', pedido.id]);
        },
        error: () => undefined,
      });
  }
  protected cancelar(): void {
    void this.router.navigate(['/pedidos']);
  }
}
