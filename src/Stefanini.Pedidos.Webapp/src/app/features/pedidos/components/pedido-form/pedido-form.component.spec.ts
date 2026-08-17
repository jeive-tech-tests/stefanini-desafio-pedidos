import { TestBed } from '@angular/core/testing';
import { PedidoFormComponent } from './pedido-form.component';

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
});
