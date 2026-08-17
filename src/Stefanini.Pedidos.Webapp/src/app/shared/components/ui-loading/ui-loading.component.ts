import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-ui-loading',
  imports: [ProgressSpinnerModule],
  template: `<div class="grid min-h-72 place-items-center p-8" role="status">
    <div class="text-center">
      <p-progress-spinner [ariaLabel]="label" [style]="{ width: '44px', height: '44px' }" />
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ label }}</p>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLoadingComponent {
  @Input() label = 'Carregando...';
}
