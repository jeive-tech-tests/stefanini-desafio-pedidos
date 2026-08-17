import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UiButtonComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly document = inject(DOCUMENT);
  protected readonly darkTheme = signal(false);
  protected toggleTheme(): void {
    this.darkTheme.update((active) => !active);
    this.document.documentElement.classList.toggle('app-dark', this.darkTheme());
  }
}
