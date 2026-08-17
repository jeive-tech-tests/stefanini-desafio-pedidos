import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `<header class="mb-7">
    <span class="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">{{
      eyebrow
    }}</span>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
      {{ title }}
    </h1>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
      {{ description }}
    </p>
    <ng-content />
  </header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title = '';
  @Input() description = '';
}
