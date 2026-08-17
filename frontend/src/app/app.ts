import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, RouterLink, RouterLinkActive, RouterOutlet, TooltipModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly temaEscuro = signal(false);

  protected alternarTema(): void {
    this.temaEscuro.update((ativo) => !ativo);
    this.document.documentElement.classList.toggle('app-dark', this.temaEscuro());
  }
}
