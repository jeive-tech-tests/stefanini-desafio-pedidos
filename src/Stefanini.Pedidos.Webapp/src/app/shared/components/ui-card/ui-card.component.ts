import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type UiCardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-card',
  template: `<section [class]="classes"><ng-content /></section>`,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  @Input() padding: UiCardPadding = 'md';
  @Input() cardClass = '';

  protected get classes(): string {
    const padding = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-5 sm:p-7' }[this.padding];
    return `rounded-2xl border border-slate-200 bg-white shadow-panel dark:border-blue-900/70 dark:bg-[#0d1d38] ${padding} ${this.cardClass}`.trim();
  }
}
