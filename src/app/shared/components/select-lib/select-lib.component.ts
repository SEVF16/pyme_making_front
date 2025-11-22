import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

export interface Option {
  label: string;
  value: any;
}

@Component({
  selector: 'app-select-lib',
  standalone: true,
  imports: [DropdownModule, ReactiveFormsModule, CommonModule],
  templateUrl: './select-lib.component.html',
  styleUrl: './select-lib.component.scss'
})
export class SelectLibComponent {
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() options: Option[] = [];
  @Input() disabled: boolean = false;
  @Input() filter: boolean = false;
  @Input() showClear: boolean = false;
  @Input() control?: AbstractControl | null = null;

  selectId = `simple-select-${Math.random().toString(36).substr(2, 9)}`;

  hasRequiredValidator(): boolean {
    if (!this.control?.validator) return false;
    const validator = this.control.validator({} as AbstractControl);
    return !!(validator && validator['required']);
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

  getClasses(): string {
    return this.hasError() ? 'ng-invalid ng-dirty' : '';
  }
}