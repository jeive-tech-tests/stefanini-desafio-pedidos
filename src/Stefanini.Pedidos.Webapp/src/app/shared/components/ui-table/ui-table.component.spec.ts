import { TestBed } from '@angular/core/testing';
import { UiTableComponent } from './ui-table.component';

describe('UiTableComponent', () => {
  it('anexa o seletor do paginador ao body para evitar recorte pelo container', async () => {
    await TestBed.configureTestingModule({ imports: [UiTableComponent] }).compileComponents();

    const fixture = TestBed.createComponent(UiTableComponent);

    expect(fixture.componentInstance.paginatorAppendTo).toBe('body');
  });
});
