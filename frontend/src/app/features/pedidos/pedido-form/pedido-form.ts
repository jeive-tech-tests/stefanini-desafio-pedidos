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
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, finalize, forkJoin, of } from 'rxjs';
import { PedidoRequest, PedidoResponse } from '../../../core/models/pedido.model';
import { ProdutoResponse } from '../../../core/models/produto.model';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProdutosService } from '../../../core/services/produtos.service';
import { mensagemErroHttp } from '../../../core/utils/http-error';

type ItemPedidoForm = FormGroup<{
  idProduto: FormControl<number | null>;
  quantidade: FormControl<number>;
}>;

@Component({
  selector: 'app-pedido-form',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './pedido-form.html',
  styleUrl: './pedido-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoForm implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly produtosService = inject(ProdutosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly produtos = signal<ProdutoResponse[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly totalEstimado = signal(0);
  protected readonly pedidoId = this.obterPedidoId();
  protected readonly editando = this.pedidoId !== null;

  protected readonly form = new FormGroup({
    nomeCliente: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    emailCliente: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(60)],
    }),
    pago: new FormControl(false, { nonNullable: true }),
    itensPedido: new FormArray<ItemPedidoForm>([]),
  });

  protected get itens(): FormArray<ItemPedidoForm> {
    return this.form.controls.itensPedido;
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularTotal());

    const pedido$: Observable<PedidoResponse | null> = this.pedidoId
      ? this.pedidosService.obterPorId(this.pedidoId)
      : of(null);

    forkJoin({
      produtos: this.produtosService.listar(),
      pedido: pedido$,
    })
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ produtos, pedido }) => {
          this.produtos.set(produtos);
          if (pedido) {
            this.preencherPedido(pedido);
          } else {
            this.adicionarItem();
          }
          this.recalcularTotal();
        },
        error: (error: unknown) => this.erro.set(mensagemErroHttp(error)),
      });
  }

  protected adicionarItem(idProduto: number | null = null, quantidade = 1): void {
    this.itens.push(
      new FormGroup({
        idProduto: new FormControl<number | null>(idProduto, {
          validators: [Validators.required, Validators.min(1)],
        }),
        quantidade: new FormControl(quantidade, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(1)],
        }),
      }),
    );
  }

  protected removerItem(index: number): void {
    if (this.itens.length === 1) {
      this.erro.set('O pedido deve possuir ao menos um item.');
      return;
    }

    this.itens.removeAt(index);
    this.erro.set(null);
  }

  protected valorProduto(idProduto: number | null): number {
    return this.produtos().find((produto) => produto.id === idProduto)?.valor ?? 0;
  }

  protected subtotalItem(index: number): number {
    const item = this.itens.at(index).getRawValue();
    return this.valorProduto(item.idProduto) * item.quantidade;
  }

  protected totalUnidades(): number {
    return this.form.getRawValue().itensPedido.reduce((total, item) => total + item.quantidade, 0);
  }

  protected salvar(): void {
    this.erro.set(null);

    if (this.form.invalid || this.itens.length === 0) {
      this.form.markAllAsTouched();
      this.erro.set('Revise os campos obrigatórios antes de salvar.');
      return;
    }

    const value = this.form.getRawValue();
    const idsProdutos = value.itensPedido.map((item) => item.idProduto);

    if (new Set(idsProdutos).size !== idsProdutos.length) {
      this.erro.set('Cada produto pode aparecer apenas uma vez no pedido.');
      return;
    }

    const request: PedidoRequest = {
      nomeCliente: value.nomeCliente.trim(),
      emailCliente: value.emailCliente.trim(),
      pago: value.pago,
      itensPedido: value.itensPedido.map((item) => ({
        idProduto: item.idProduto!,
        quantidade: item.quantidade,
      })),
    };

    const operacao$ = this.pedidoId
      ? this.pedidosService.atualizar(this.pedidoId, request)
      : this.pedidosService.criar(request);

    this.salvando.set(true);
    operacao$
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pedido) => {
          const acao = this.editando ? 'atualizado' : 'criado';
          void this.router.navigate(['/pedidos'], {
            queryParams: { sucesso: `Pedido #${pedido.id} ${acao} com sucesso.` },
          });
        },
        error: (error: unknown) => this.erro.set(mensagemErroHttp(error)),
      });
  }

  private preencherPedido(pedido: PedidoResponse): void {
    this.form.patchValue({
      nomeCliente: pedido.nomeCliente,
      emailCliente: pedido.emailCliente,
      pago: pedido.pago,
    });

    this.itens.clear();
    pedido.itensPedido.forEach((item) => this.adicionarItem(item.idProduto, item.quantidade));
  }

  private recalcularTotal(): void {
    const total = this.itens.controls.reduce(
      (soma, _, index) => soma + this.subtotalItem(index),
      0,
    );

    this.totalEstimado.set(total);
  }

  private obterPedidoId(): number | null {
    const valor = Number(this.route.snapshot.paramMap.get('id'));
    return Number.isInteger(valor) && valor > 0 ? valor : null;
  }
}
