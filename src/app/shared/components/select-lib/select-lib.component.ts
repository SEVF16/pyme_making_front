import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
export interface Option {
  label: string;
  value: any;
}
@Component({
  selector: 'app-select-lib',
  standalone: true,
  imports: [DropdownModule, FormsModule, ],
  templateUrl: './select-lib.component.html',
  styleUrl: './select-lib.component.scss'
})
export class SelectLibComponent implements OnInit{
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() options: Option[] = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() filter: boolean = false;
  @Input() showClear: boolean = false;
  @Input() control?: AbstractControl | null = null;

  value: any = null;
  selectId = `simple-select-${Math.random().toString(36).substr(2, 9)}`;
  ngOnInit(): void {
    console.log(this.control);
  }
  // ControlValueAccessor methods
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Helper methods
  getClasses(): string {
    return this.hasError() ? 'simple-select-error' : '';
  }

  hasError(): boolean {
    return !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched));
  }

  getErrorMessage(): string {
    if (!this.control?.errors) return '';

    const errors = this.control.errors;
    
    if (errors['required']) return `${this.label || 'Este campo'} es requerido`;
    
    return 'Campo inválido';
  }
}
