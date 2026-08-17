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
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { UiLoadingComponent } from '../../../../shared/components/ui-loading/ui-loading.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { UiModalComponent } from '../../../../shared/components/ui-modal/ui-modal.component';
import { UiProductImageComponent } from '../../../../shared/components/ui-product-image/ui-product-image.component';
import { UiTagComponent } from '../../../../shared/components/ui-tag/ui-tag.component';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-pedido-details',
  imports: [
    CurrencyPipe,
    UiLoadingComponent,
    UiCardComponent,
    UiModalComponent,
    UiProductImageComponent,
    UiTagComponent,
  ],
  templateUrl: './pedido-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoDetailsComponent implements OnInit {
  private readonly service = inject(PedidoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  ngOnInit(): void {
    forkJoin({
      pedido: this.service.obterPorId(this.id),
      produtos: this.produtoService.listar(),
    })
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

  protected imagemProduto(idProduto: number): string {
    return this.produtos().find((produto) => produto.id === idProduto)?.imagemUrl ?? '';
  }

  protected fechar(): void {
    void this.router.navigate(['/pedidos']);
  }
}
