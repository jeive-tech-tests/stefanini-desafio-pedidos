import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  afterEach(() => document.documentElement.classList.remove('app-dark'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application identity', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[aria-label="Ir para pedidos"]')?.textContent).toContain(
      'Pedidos',
    );
    expect(compiled.querySelector('nav')?.textContent).toContain('Novo pedido');
  });

  it('should toggle the dark theme', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      '[aria-label="Ativar tema escuro"]',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('app-dark')).toBe(true);
  });
});
