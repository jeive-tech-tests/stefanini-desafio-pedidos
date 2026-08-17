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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-pedido-details',
  imports: [
    ButtonModule,
    CurrencyPipe,
    LoadingComponent,
    PageHeaderComponent,
    RouterLink,
    TagModule,
  ],
  templateUrl: './pedido-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoDetailsComponent implements OnInit {
  private readonly service = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly carregando = signal(true);
  ngOnInit(): void {
    this.service
      .obterPorId(this.id)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pedido) => this.pedido.set(pedido),
        error: () => undefined,
      });
  }
}
