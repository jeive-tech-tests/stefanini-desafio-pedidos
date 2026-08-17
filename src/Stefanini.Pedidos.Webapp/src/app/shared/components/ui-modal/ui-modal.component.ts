import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-ui-modal',
  imports: [DialogModule],
  templateUrl: './ui-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiModalComponent {
  @Input() visible = false;
  @Input({ required: true }) header = '';
  @Input() width = 'min(1200px, 96vw)';
  @Input() closable = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  protected changeVisibility(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) this.closed.emit();
  }
}
