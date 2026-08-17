import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-ui-toast',
  imports: [ToastModule],
  template: '<p-toast [position]="position" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToastComponent {
  @Input() position:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'center' = 'top-right';
}
