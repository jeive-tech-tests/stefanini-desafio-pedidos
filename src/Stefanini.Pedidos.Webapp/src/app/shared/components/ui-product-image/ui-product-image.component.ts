import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';

type ProductImageSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-product-image',
  imports: [NgTemplateOutlet, PopoverModule],
  templateUrl: './ui-product-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiProductImageComponent {
  @Input({ required: true }) src = '';
  @Input({ required: true }) alt = '';
  @Input() size: ProductImageSize = 'md';
  @Input() previewEnabled = true;

  protected readonly failed = signal(false);

  protected showPreview(event: Event, popover: Popover): void {
    if (!this.failed()) popover.show(event);
  }
}
