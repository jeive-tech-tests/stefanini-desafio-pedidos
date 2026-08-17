import { Signal, SimpleChange } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Pedido } from '../../models/pedido.model';
import { Produto } from '../../models/produto.model';
import { PedidoItemFormGroup } from '../pedido-item-form/pedido-item-form.component';
import { PedidoFormComponent } from './pedido-form.component';

interface PedidoFormHarness {
  form: FormGroup;
  itens: FormArray<PedidoItemFormGroup>;
  erro: Signal<string | null>;
  totalEstimado: Signal<number>;
  adicionarItem(idProduto?: number | null, quantidade?: number): void;
  removerItem(index: number): void;
  podeAdicionarItem(): boolean;
  produtosDisponiveis(index: number): Produto[];
  salvar(): void;
}

const produtos: Produto[] = [
  { id: 1, nomeProduto: 'Notebook', valor: 100, imagemUrl: '/notebook.svg' },
  { id: 2, nomeProduto: 'Mouse', valor: 25, imagemUrl: '/mouse.svg' },
];

function harness(component: PedidoFormComponent): PedidoFormHarness {
  return component as unknown as PedidoFormHarness;
}

describe('PedidoFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PedidoFormComponent] }).compileComponents();
  });

  it('não envia um formulário inválido', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    const emitted = vi.fn();
    fixture.componentInstance.submitted.subscribe(emitted);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Revise os campos obrigatórios');
  });

  it('inicia com um item de pedido', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-pedido-item-form')).toHaveLength(1);
  });

  it('mantém a lista de itens em uma região com rolagem interna', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.detectChanges();

    const lista = fixture.nativeElement.querySelector(
      '[aria-label="Itens adicionados ao pedido"]',
    ) as HTMLElement;

    expect(lista).toBeTruthy();
    expect(lista.classList.contains('max-h-[23rem]')).toBe(true);
    expect(lista.classList.contains('overflow-y-auto')).toBe(true);
    expect(lista.getAttribute('tabindex')).toBe('0');
  });

  it('envia um pedido válido normalizando os dados do cliente', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    const emitted = vi.fn();
    fixture.componentInstance.produtos = produtos;
    fixture.componentInstance.submitted.subscribe(emitted);
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);
    component.form.patchValue({
      nomeCliente: '  Maria da Silva  ',
      emailCliente: 'maria@example.com',
      pago: true,
    });
    component.itens.at(0).setValue({ idProduto: 1, quantidade: 2 });

    component.salvar();

    expect(emitted).toHaveBeenCalledWith({
      nomeCliente: 'Maria da Silva',
      emailCliente: 'maria@example.com',
      pago: true,
      itensPedido: [{ idProduto: 1, quantidade: 2 }],
    });
  });

  it('calcula o total estimado ao alterar produtos e quantidades', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.componentInstance.produtos = produtos;
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);

    component.itens.at(0).setValue({ idProduto: 1, quantidade: 2 });
    component.adicionarItem(2, 4);

    expect(component.totalEstimado()).toBe(300);
  });

  it('rejeita produtos duplicados', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    const emitted = vi.fn();
    fixture.componentInstance.produtos = produtos;
    fixture.componentInstance.submitted.subscribe(emitted);
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);
    component.form.patchValue({
      nomeCliente: 'Maria',
      emailCliente: 'maria@example.com',
    });
    component.itens.at(0).setValue({ idProduto: 1, quantidade: 1 });
    component.adicionarItem(1, 2);

    component.salvar();

    expect(emitted).not.toHaveBeenCalled();
    expect(component.erro()).toContain('apenas uma vez');
  });

  it('remove dos seletores os produtos usados em outros itens', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.componentInstance.produtos = produtos;
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);
    component.itens.at(0).controls.idProduto.setValue(1);
    component.adicionarItem(2);

    expect(component.produtosDisponiveis(0).map((produto) => produto.id)).toEqual([1]);
    expect(component.produtosDisponiveis(1).map((produto) => produto.id)).toEqual([2]);
  });

  it('limita a quantidade de itens ao catálogo disponível', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.componentInstance.produtos = produtos;
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);

    expect(component.podeAdicionarItem()).toBe(true);
    component.adicionarItem();
    expect(component.podeAdicionarItem()).toBe(false);
    component.adicionarItem();
    expect(component.itens.length).toBe(2);
  });

  it('não permite remover o único item', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.detectChanges();
    const component = harness(fixture.componentInstance);

    component.removerItem(0);

    expect(component.itens.length).toBe(1);
    expect(component.erro()).toContain('ao menos um item');
  });

  it('preenche o formulário ao editar um pedido', () => {
    const fixture = TestBed.createComponent(PedidoFormComponent);
    fixture.componentInstance.produtos = produtos;
    fixture.detectChanges();
    const pedido: Pedido = {
      id: 42,
      nomeCliente: 'Cliente Atual',
      emailCliente: 'atual@example.com',
      pago: true,
      valorTotal: 50,
      itensPedido: [
        {
          id: 10,
          idProduto: 2,
          nomeProduto: 'Mouse',
          valorUnitario: 25,
          quantidade: 2,
        },
      ],
    };

    fixture.componentInstance.pedido = pedido;
    fixture.componentInstance.ngOnChanges({
      pedido: new SimpleChange(null, pedido, false),
    });

    const component = harness(fixture.componentInstance);
    expect(component.form.getRawValue()).toEqual({
      nomeCliente: 'Cliente Atual',
      emailCliente: 'atual@example.com',
      pago: true,
      itensPedido: [{ idProduto: 2, quantidade: 2 }],
    });
    expect(component.totalEstimado()).toBe(50);
  });
});
