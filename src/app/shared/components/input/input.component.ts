// input.component.ts - FormControl como Input
import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { InputTextModule } from 'primeng/inputtext';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MaskConfig } from './interfaces/mask-config.interface';
export type IconPosition = 'left' | 'right';
export type IconType = 'icon' | 'button';
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    LucideAngularModule,
    NgxMaskDirective
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  
  // Inputs del componente
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  iconName = input<LucideIconData | null>(null);
  iconPosition = input<IconPosition>('left');
  iconSize = input<number>(16);
  iconType = input<IconType>('icon'); 
  size = input<'small' | 'medium' | 'large'>('medium');
  readonly = input<boolean>(false);
  maxLength = input<number | null>(null);
  minLength = input<number | null>(null);
  customClass = input<string>('');
  mask = input<string | MaskConfig>('');


  // FormControl como input - ESTE ES EL PUNTO CLAVE
  control = input.required<any | FormControl>();
  iconClick = output<void>();
  // ID único para el input
  private inputIdValue = `input-${Math.random().toString(36).substr(2, 9)}`;
  inputId = computed(() => this.inputIdValue);
  // Computed para extraer las propiedades
maskPattern = computed(() => {
  const maskValue = this.mask();
  return typeof maskValue === 'string' ? maskValue : maskValue?.mask || '';
});

maskOptions = computed(() => {
  const maskValue = this.mask();
  if (typeof maskValue === 'object' && maskValue !== null) {
    const { mask, ...options } = maskValue;
    return options;
  }
  return {};
});
  // Clases computadas
  containerClass = computed(() => {
    const classes = ['reusable-input-container'];
    if (this.customClass()) classes.push(this.customClass());
    return classes.join(' ');
  });
    hasValidControl = computed(() => {
    return this.control() !== null && this.control() instanceof FormControl;
  });
  inputWrapperClass = computed(() => {
    const classes = ['input-wrapper'];
    
    // Agregar clase según la posición del icono
    if (this.iconName()) {
      classes.push(this.iconPosition() === 'left' ? 'has-icon-left' : 'has-icon-right');
    }
    
    // Agregar clase de tamaño
    if (this.size() !== 'medium') {
      classes.push(`input-${this.size()}`);
    }
    
    return classes.join(' ');
  });

    onIconClick(event: Event): void {
    event.stopPropagation();
    
    // Solo emitir el evento si el ícono es de tipo botón
    if (this.iconType() === 'button') {
      this.iconClick.emit();
    }
  }
  hasRequiredValidator(): boolean {
    if (!this.control()?.validator) return false;
    
    const validator = this.control().validator({} as AbstractControl);
    return !!(validator && validator['required']);
  }
  // Verificar si el ícono es clickeable (tipo botón)
  isIconClickable = computed(() => this.iconType() === 'button');
}