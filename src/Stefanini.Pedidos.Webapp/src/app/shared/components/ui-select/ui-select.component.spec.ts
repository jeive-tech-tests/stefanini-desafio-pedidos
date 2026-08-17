import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Select } from 'primeng/select';
import { UiSelectComponent } from './ui-select.component';

@Component({
  imports: [UiSelectComponent],
  template: `
    <app-ui-select
      [options]="options"
      optionLabel="nome"
      optionValue="id"
      [filter]="true"
      filterBy="nome"
      filterPlaceholder="Buscar produto..."
      emptyFilterMessage="Nenhum produto encontrado."
      [showClear]="true"
    />
  `,
})
class UiSelectHostComponent {
  readonly options = [
    { id: 1, nome: 'Notebook' },
    { id: 2, nome: 'Mouse' },
  ];
}

describe('UiSelectComponent', () => {
  it('repassa a configuração de pesquisa para o PrimeNG Select', async () => {
    await TestBed.configureTestingModule({ imports: [UiSelectHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(UiSelectHostComponent);
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.directive(Select)).componentInstance as Select;

    expect(select.filter).toBe(true);
    expect(select.filterBy).toBe('nome');
    expect(select.filterPlaceholder).toBe('Buscar produto...');
    expect(select.emptyFilterMessage).toBe('Nenhum produto encontrado.');
    expect(select.resetFilterOnHide).toBe(true);
    expect(select.showClear).toBe(true);
  });
});
