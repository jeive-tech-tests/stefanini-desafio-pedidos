import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

type UiButtonSeverity =
  'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
type UiButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-ui-button',
  imports: [ButtonModule, RouterLink, TooltipModule],
  templateUrl: './ui-button.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  @Input() label = '';
  @Input() icon?: string;
  @Input() severity: UiButtonSeverity = 'primary';
  @Input() type: UiButtonType = 'button';
  @Input() routerLink?: string | readonly unknown[];
  @Input() href?: string;
  @Input() target?: string;
  @Input() ariaLabel?: string;
  @Input() tooltip?: string;
  @Input() outlined = false;
  @Input() text = false;
  @Input() rounded = false;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fluid = false;
  @Input() buttonClass = '';
  @Output() clicked = new EventEmitter<MouseEvent>();

  protected get classes(): string {
    return `${this.fluid ? 'w-full justify-center' : ''} ${this.buttonClass}`.trim();
  }
}
