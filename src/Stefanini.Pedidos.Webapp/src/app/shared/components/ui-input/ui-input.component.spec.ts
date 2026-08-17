import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { UiInputComponent } from './ui-input.component';

@Component({
  imports: [ReactiveFormsModule, UiInputComponent],
  template: `<app-ui-input [formControl]="control" placeholder="Nome" />`,
})
class UiInputHostComponent {
  readonly control = new FormControl('Valor inicial', { nonNullable: true });
}

describe('UiInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiInputHostComponent] }).compileComponents();
  });

  it('integra valores nos dois sentidos com Reactive Forms', () => {
    const fixture = TestBed.createComponent(UiInputHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.value).toBe('Valor inicial');

    input.value = 'Valor alterado';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('Valor alterado');

    fixture.componentInstance.control.setValue('Valor programático');
    fixture.detectChanges();
    expect(input.value).toBe('Valor programático');
  });

  it('reflete o estado desabilitado do formulário', () => {
    const fixture = TestBed.createComponent(UiInputHostComponent);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });
});
