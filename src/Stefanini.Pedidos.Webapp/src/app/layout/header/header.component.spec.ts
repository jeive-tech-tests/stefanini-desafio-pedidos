import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

interface HeaderHarness {
  toggleTheme(): void;
}

describe('HeaderComponent', () => {
  afterEach(() => {
    TestBed.inject(DOCUMENT).documentElement.classList.remove('app-dark');
  });

  it('mantém somente a listagem na navegação principal', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const navigation: HTMLElement = fixture.nativeElement.querySelector('nav');

    expect(navigation.textContent).toContain('Pedidos');
    expect(navigation.textContent).not.toContain('Novo pedido');
    expect(navigation.querySelectorAll('a')).toHaveLength(1);
  });

  it('alterna o tema da aplicação', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance as unknown as HeaderHarness;
    const document = TestBed.inject(DOCUMENT);

    component.toggleTheme();
    expect(document.documentElement.classList.contains('app-dark')).toBe(true);

    component.toggleTheme();
    expect(document.documentElement.classList.contains('app-dark')).toBe(false);
  });
});
