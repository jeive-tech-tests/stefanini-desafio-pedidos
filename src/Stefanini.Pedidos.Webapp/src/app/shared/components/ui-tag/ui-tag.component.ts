import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

type UiTagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-ui-tag',
  imports: [TagModule],
  template: `
    <p-tag
      [severity]="severity"
      [value]="value"
      [icon]="icon"
      [rounded]="rounded"
      [attr.aria-label]="ariaLabel || value"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTagComponent {
  @Input() severity: UiTagSeverity = 'secondary';
  @Input() value = '';
  @Input() icon?: string;
  @Input() rounded = false;
  @Input() ariaLabel?: string;
}
