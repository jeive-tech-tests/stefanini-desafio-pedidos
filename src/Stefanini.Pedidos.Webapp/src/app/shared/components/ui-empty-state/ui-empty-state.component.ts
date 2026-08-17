import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-empty-state',
  template: `<div class="grid min-h-72 place-items-center p-8 text-center">
    <div>
      <span
        class="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        ><i [class]="icon"></i
      ></span>
      <h2 class="mt-4 text-lg font-bold text-slate-950 dark:text-white">{{ title }}</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
      <div class="mt-5"><ng-content /></div>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyStateComponent {
  @Input() icon = 'pi pi-inbox';
  @Input({ required: true }) title = '';
  @Input() description = '';
}
