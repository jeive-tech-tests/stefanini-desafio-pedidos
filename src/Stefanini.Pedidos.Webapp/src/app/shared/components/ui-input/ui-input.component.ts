import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

type UiInputType = 'text' | 'email' | 'search' | 'password' | 'tel' | 'url';

@Component({
  selector: 'app-ui-input',
  imports: [InputTextModule],
  templateUrl: './ui-input.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent implements ControlValueAccessor {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input() type: UiInputType = 'text';
  @Input() placeholder = '';
  @Input() autocomplete?: string;
  @Input() maxlength?: number;
  @Input() invalid = false;
  @Input() ariaLabel?: string;
  @Input() inputClass = '';

  protected value = '';
  protected disabled = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.changeDetector.markForCheck();
  }

  protected updateValue(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  protected markAsTouched(): void {
    this.onTouched();
  }
}
