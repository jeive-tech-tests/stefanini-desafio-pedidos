import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { UiLoadingComponent } from '../../../../shared/components/ui-loading/ui-loading.component';
import { UiPageHeaderComponent } from '../../../../shared/components/ui-page-header/ui-page-header.component';
import { PedidoFormComponent } from '../../components/pedido-form/pedido-form.component';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { UpdatePedido } from '../../models/update-pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-pedido-edit',
  imports: [PedidoFormComponent, RouterLink, UiLoadingComponent, UiPageHeaderComponent],
  templateUrl: './pedido-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoEditComponent implements OnInit {
  private readonly service = inject(PedidoService);
  private readonly products = inject(ProdutoService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  ngOnInit(): void {
    forkJoin({ pedido: this.service.obterPorId(this.id), produtos: this.products.listar() })
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ pedido, produtos }) => {
          this.pedido.set(pedido);
          this.produtos.set(produtos);
        },
        error: () => undefined,
      });
  }
  protected salvar(request: UpdatePedido): void {
    this.salvando.set(true);
    this.service
      .atualizar(this.id, request)
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pedido) => {
          this.notifications.success(
            'Pedido atualizado',
            `Pedido #${pedido.id} atualizado com sucesso.`,
          );
          void this.router.navigate(['/pedidos', pedido.id]);
        },
        error: () => undefined,
      });
  }
  protected cancelar(): void {
    void this.router.navigate(['/pedidos', this.id]);
  }
}
