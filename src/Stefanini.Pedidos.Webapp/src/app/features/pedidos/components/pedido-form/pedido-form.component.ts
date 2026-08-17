import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatePedido } from '../../models/create-pedido.model';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { UiMessageComponent } from '../../../../shared/components/ui-message/ui-message.component';
import { UiToggleSwitchComponent } from '../../../../shared/components/ui-toggle-switch/ui-toggle-switch.component';
import {
  PedidoItemFormComponent,
  PedidoItemFormGroup,
  createPedidoItemForm,
} from '../pedido-item-form/pedido-item-form.component';

@Component({
  selector: 'app-pedido-form',
  imports: [
    CurrencyPipe,
    PedidoItemFormComponent,
    ReactiveFormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiMessageComponent,
    UiToggleSwitchComponent,
  ],
  templateUrl: './pedido-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoFormComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  @Input() pedido: Pedido | null = null;
  @Input() produtos: Produto[] = [];
  @Input() salvando = false;
  @Output() submitted = new EventEmitter<CreatePedido>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly erro = signal<string | null>(null);
  protected readonly totalEstimado = signal(0);
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
    itensPedido: new FormArray<PedidoItemFormGroup>([]),
  });

  protected get itens(): FormArray<PedidoItemFormGroup> {
    return this.form.controls.itensPedido;
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularTotal());
    if (this.itens.length === 0) this.adicionarItem();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedido'] && this.pedido) this.preencherPedido(this.pedido);
    if (changes['produtos']) this.recalcularTotal();
  }

  protected adicionarItem(idProduto: number | null = null, quantidade = 1): void {
    if (this.produtos.length > 0 && this.itens.length >= this.produtos.length) return;
    this.itens.push(createPedidoItemForm(idProduto, quantidade));
    this.recalcularTotal();
  }

  protected removerItem(index: number): void {
    if (this.itens.length === 1) {
      this.erro.set('O pedido deve possuir ao menos um item.');
      return;
    }
    this.itens.removeAt(index);
    this.erro.set(null);
    this.recalcularTotal();
  }

  protected totalUnidades(): number {
    return this.itens.getRawValue().reduce((sum, item) => sum + item.quantidade, 0);
  }

  protected podeAdicionarItem(): boolean {
    return this.itens.length < this.produtos.length;
  }

  protected produtosDisponiveis(index: number): Produto[] {
    const produtoAtual = this.itens.at(index).controls.idProduto.value;
    const produtosSelecionados = new Set(
      this.itens.controls
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item) => item.controls.idProduto.value)
        .filter((id): id is number => id !== null),
    );

    return this.produtos.filter(
      (produto) => produto.id === produtoAtual || !produtosSelecionados.has(produto.id),
    );
  }

  protected salvar(): void {
    this.erro.set(null);
    if (this.form.invalid || this.itens.length === 0) {
      this.form.markAllAsTouched();
      this.erro.set('Revise os campos obrigatórios antes de salvar.');
      return;
    }
    const value = this.form.getRawValue();
    const productIds = value.itensPedido.map((item) => item.idProduto);
    if (new Set(productIds).size !== productIds.length) {
      this.erro.set('Cada produto pode aparecer apenas uma vez no pedido.');
      return;
    }
    this.submitted.emit({
      nomeCliente: value.nomeCliente.trim(),
      emailCliente: value.emailCliente.trim(),
      pago: value.pago,
      itensPedido: value.itensPedido.map((item) => ({
        idProduto: item.idProduto!,
        quantidade: item.quantidade,
      })),
    });
  }

  private preencherPedido(pedido: Pedido): void {
    this.form.patchValue({
      nomeCliente: pedido.nomeCliente,
      emailCliente: pedido.emailCliente,
      pago: pedido.pago,
    });
    this.itens.clear();
    pedido.itensPedido.forEach((item) =>
      this.itens.push(createPedidoItemForm(item.idProduto, item.quantidade)),
    );
    this.recalcularTotal();
  }

  private recalcularTotal(): void {
    this.totalEstimado.set(
      this.itens.controls.reduce((sum, item) => {
        const value = item.getRawValue();
        const price = this.produtos.find((product) => product.id === value.idProduto)?.valor ?? 0;
        return sum + price * value.quantidade;
      }, 0),
    );
  }
}
