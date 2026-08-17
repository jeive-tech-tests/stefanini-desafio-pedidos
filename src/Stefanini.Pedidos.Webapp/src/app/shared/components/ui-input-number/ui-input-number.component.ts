import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-ui-input-number',
  imports: [FormsModule, InputNumberModule],
  templateUrl: './ui-input-number.component.html',
  host: { class: 'block min-w-0' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputNumberComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputNumberComponent implements ControlValueAccessor {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input() min?: number;
  @Input() max?: number;
  @Input() showButtons = false;
  @Input() buttonLayout: 'stacked' | 'horizontal' | 'vertical' = 'stacked';
  @Input() incrementButtonIcon = 'pi pi-chevron-up';
  @Input() decrementButtonIcon = 'pi pi-chevron-down';
  @Input() invalid = false;
  @Input() ariaLabel?: string;
  @Input() inputClass = '';
  @Input() inputFieldClass = '';

  protected value: number | null = null;
  protected disabled = false;
  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.value = value;
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.changeDetector.markForCheck();
  }

  protected updateValue(value: number | null): void {
    this.value = value;
    this.onChange(value);
  }

  protected markAsTouched(): void {
    this.onTouched();
  }
}
