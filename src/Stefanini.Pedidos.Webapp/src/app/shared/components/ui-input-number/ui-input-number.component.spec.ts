import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiInputNumberComponent } from './ui-input-number.component';

describe('UiInputNumberComponent', () => {
  let fixture: ComponentFixture<UiInputNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiInputNumberComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiInputNumberComponent);
  });

  it('aplica classes de largura ao controle e ao campo interno', () => {
    fixture.componentRef.setInput('inputClass', 'flex w-full min-w-0');
    fixture.componentRef.setInput('inputFieldClass', 'w-full min-w-0');
    fixture.detectChanges();

    const controle = fixture.nativeElement.querySelector('p-inputnumber');
    const campo = fixture.nativeElement.querySelector('input');

    expect(controle.classList).toContain('min-w-0');
    expect(campo.classList).toContain('min-w-0');
  });
});
