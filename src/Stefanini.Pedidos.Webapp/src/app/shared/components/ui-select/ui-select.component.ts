import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-ui-select',
  imports: [FormsModule, SelectModule],
  templateUrl: './ui-select.component.html',
  host: { class: 'block min-w-0' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent implements ControlValueAccessor {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input() options: readonly unknown[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() placeholder?: string;
  @Input() appendTo: 'body' | HTMLElement = 'body';
  @Input() invalid = false;
  @Input() ariaLabel?: string;
  @Input() selectClass = '';
  @Input() filter = false;
  @Input() filterBy?: string;
  @Input() filterPlaceholder = 'Buscar...';
  @Input() emptyFilterMessage = 'Nenhum resultado encontrado.';
  @Input() resetFilterOnHide = true;

  protected value: unknown = null;
  protected disabled = false;
  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value = value;
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.changeDetector.markForCheck();
  }

  protected updateValue(value: unknown): void {
    this.value = value;
    this.onChange(value);
  }

  protected markAsTouched(): void {
    this.onTouched();
  }
}
