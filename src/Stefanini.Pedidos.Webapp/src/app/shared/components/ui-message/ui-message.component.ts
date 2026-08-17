import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MessageModule } from 'primeng/message';

type UiMessageSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

@Component({
  selector: 'app-ui-message',
  imports: [MessageModule],
  template: '<p-message [severity]="severity"><ng-content /></p-message>',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiMessageComponent {
  @Input() severity: UiMessageSeverity = 'info';
}
