import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Dialog } from 'primeng/dialog';
import { UiModalComponent } from './ui-modal.component';

@Component({
  imports: [UiModalComponent],
  template: `<app-ui-modal [visible]="true" header="Modal de teste">Conteúdo</app-ui-modal>`,
})
class UiModalHostComponent {}

describe('UiModalComponent', () => {
  it('limita a altura e habilita a rolagem apenas no conteúdo', async () => {
    await TestBed.configureTestingModule({ imports: [UiModalHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(UiModalHostComponent);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.directive(Dialog)).componentInstance as Dialog;

    expect(dialog.blockScroll).toBe(true);
    expect(dialog.closeOnEscape).toBe(true);
    expect(dialog.style.maxHeight).toBe('94dvh');
    expect(dialog.contentStyle.overflowY).toBe('auto');
    expect(dialog.contentStyle.overflowX).toBe('hidden');
  });
});
