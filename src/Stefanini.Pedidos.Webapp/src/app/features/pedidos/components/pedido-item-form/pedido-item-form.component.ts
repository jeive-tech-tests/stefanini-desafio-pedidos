import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { Produto } from '../../models/produto.model';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button.component';
import { UiProductImageComponent } from '../../../../shared/components/ui-product-image/ui-product-image.component';

export type PedidoItemFormGroup = FormGroup<{
  idProduto: FormControl<number | null>;
  quantidade: FormControl<number>;
}>;

export function createPedidoItemForm(
  idProduto: number | null = null,
  quantidade = 1,
): PedidoItemFormGroup {
  return new FormGroup({
    idProduto: new FormControl<number | null>(idProduto, [Validators.required, Validators.min(1)]),
    quantidade: new FormControl(quantidade, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });
}

@Component({
  selector: 'app-pedido-item-form',
  imports: [
    CurrencyPipe,
    InputNumberModule,
    ReactiveFormsModule,
    SelectModule,
    UiButtonComponent,
    UiProductImageComponent,
  ],
  templateUrl: './pedido-item-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoItemFormComponent {
  @Input({ required: true }) group!: PedidoItemFormGroup;
  @Input() produtos: Produto[] = [];
  @Input() index = 0;
  @Output() remove = new EventEmitter<void>();

  protected get unitPrice(): number {
    return this.produtos.find((p) => p.id === this.group.controls.idProduto.value)?.valor ?? 0;
  }
  protected get selectedProduct(): Produto | undefined {
    return this.produtos.find((produto) => produto.id === this.group.controls.idProduto.value);
  }
  protected get subtotal(): number {
    return this.unitPrice * this.group.controls.quantidade.value;
  }
}
