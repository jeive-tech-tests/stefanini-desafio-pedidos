import { TestBed } from '@angular/core/testing';
import { Produto } from '../../models/produto.model';
import { PedidoItemFormComponent, createPedidoItemForm } from './pedido-item-form.component';

interface PedidoItemHarness {
  unitPrice: number;
  subtotal: number;
  selectedProduct: Produto | undefined;
}

describe('PedidoItemFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoItemFormComponent],
    }).compileComponents();
  });

  it('cria o grupo com quantidade inicial válida e produto obrigatório', () => {
    const group = createPedidoItemForm();

    expect(group.controls.idProduto.invalid).toBe(true);
    expect(group.controls.quantidade.value).toBe(1);
    expect(group.controls.quantidade.valid).toBe(true);
  });

  it('calcula valor e subtotal para o produto selecionado', () => {
    const fixture = TestBed.createComponent(PedidoItemFormComponent);
    const produto: Produto = {
      id: 2,
      nomeProduto: 'Mouse',
      valor: 25,
      imagemUrl: '/mouse.svg',
    };
    fixture.componentInstance.group = createPedidoItemForm(2, 4);
    fixture.componentInstance.produtos = [produto];
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoItemHarness;

    expect(component.selectedProduct).toBe(produto);
    expect(component.unitPrice).toBe(25);
    expect(component.subtotal).toBe(100);
  });

  it('retorna valores zerados quando nenhum produto está selecionado', () => {
    const fixture = TestBed.createComponent(PedidoItemFormComponent);
    fixture.componentInstance.group = createPedidoItemForm();
    fixture.componentInstance.produtos = [];
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as PedidoItemHarness;

    expect(component.selectedProduct).toBeUndefined();
    expect(component.unitPrice).toBe(0);
    expect(component.subtotal).toBe(0);
  });
});
