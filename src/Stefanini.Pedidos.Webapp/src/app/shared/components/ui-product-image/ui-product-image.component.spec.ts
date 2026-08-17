import { TestBed } from '@angular/core/testing';
import { UiProductImageComponent } from './ui-product-image.component';

describe('UiProductImageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiProductImageComponent],
    }).compileComponents();
  });

  it('mantém o preview disponível por padrão', () => {
    const fixture = TestBed.createComponent(UiProductImageComponent);
    fixture.componentRef.setInput('src', '/notebook.svg');
    fixture.componentRef.setInput('alt', 'Notebook');
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Ampliar imagem de Notebook');
  });

  it('renderiza uma imagem estática quando o preview está desabilitado', () => {
    const fixture = TestBed.createComponent(UiProductImageComponent);
    fixture.componentRef.setInput('src', '/notebook.svg');
    fixture.componentRef.setInput('alt', 'Notebook');
    fixture.componentRef.setInput('previewEnabled', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.querySelector('p-popover')).toBeNull();
    expect(fixture.nativeElement.querySelector('img').alt).toBe('Notebook');
  });
});
