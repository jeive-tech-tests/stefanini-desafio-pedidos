import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Injectable({ providedIn: 'root' })
export class UiConfirmationService {
  private readonly confirmationService = inject(ConfirmationService);

  confirm(confirmation: Confirmation): void {
    this.confirmationService.confirm(confirmation);
  }
}

@Component({
  selector: 'app-ui-confirm-dialog',
  imports: [ConfirmDialogModule],
  template: '<p-confirmdialog />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiConfirmDialogComponent {}
