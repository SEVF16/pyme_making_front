import { CommonModule } from '@angular/common';
import { Component, input, computed, output, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Subject, takeUntil } from 'rxjs';

export interface Option {
  label: string;
  value: string;
}

export type IconPosition = 'left' | 'right';
export type IconType = 'icon' | 'button';

@Component({
  selector: 'app-autocomplete-lib',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    LucideAngularModule
  ],
  templateUrl: './autocomplete-lib.component.html',
  styleUrl: './autocomplete-lib.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteLibComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  label = input<string>('');
  placeholder = input<string>('Buscar...');
  iconName = input<LucideIconData | null>(null);
  iconPosition = input<IconPosition>('left');
  iconSize = input<number>(16);
  iconType = input<IconType>('icon'); 
  size = input<'small' | 'medium' | 'large'>('medium');
  readonly = input<boolean>(false);
  customClass = input<string>('');
  
  // Específicos del autocomplete
  options = input.required<Option[]>();
  minLength = input<number>(1);
  maxResults = input<number>(10);
  dropdown = input<boolean>(true);
  forceSelection = input<boolean>(false);
  emptyMessage = input<string>('No se encontraron resultados');
  clearAfterSelection = input<boolean>(false);
  
  // FormControl como input
  control = input.required<any | FormControl>();
  
  // Outputs
  iconClick = output<void>();
  onSelect = output<Option>();
  onClear = output<void>();
  onSearch = output<string>();
  
  // ID único para el autocomplete
  private inputIdValue = `autocomplete-${Math.random().toString(36).substr(2, 9)}`;
  inputId = computed(() => this.inputIdValue);
  
  // Clases computadas
  containerClass = computed(() => {
    const classes = ['reusable-autocomplete-container'];
    if (this.customClass()) classes.push(this.customClass());
    return classes.join(' ');
  });

  autocompleteWrapperClass = computed(() => {
    const classes = ['autocomplete-wrapper'];
    
    if (this.iconName()) {
      classes.push(this.iconPosition() === 'left' ? 'has-icon-left' : 'has-icon-right');
    }
    
    if (this.size() !== 'medium') {
      classes.push(`autocomplete-${this.size()}`);
    }
    
    return classes.join(' ');
  });

  isIconClickable = computed(() => this.iconType() === 'button');

  ngOnInit() {
    // Remover cualquier suscripción automática del valueChanges
    // El componente padre manejará la búsqueda a través del evento onSearch
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIconClick(event: Event): void {
    event.stopPropagation();
    if (this.iconType() === 'button') {
      this.iconClick.emit();
    }
  }

  // Método mejorado para manejar cambios en el input
  onCompleteMethod(event: any): void {
    const query = event.query || '';
    console.log('AutoComplete search triggered:', query);
    
    // Emitir inmediatamente la búsqueda sin esperas adicionales
    if (query.length >= this.minLength()) {
      this.onSearch.emit(query);
    }
  }

  // Método para manejar el foco (opcional, para mostrar resultados al hacer foco)
  onInputFocus(event: any): void {
    const value = event.target.value || '';
    if (value.length >= this.minLength()) {
      this.onSearch.emit(value);
    }
  }

  hasRequiredValidator(): boolean {
    if (!this.control()?.validator) return false;
    
    const validator = this.control().validator || (() => null);
    const result = validator({} as AbstractControl);
    return !!(result && result['required']);
  }

  onOptionSelect(event: any): void {
    const selectedOption = event.value;
    if (selectedOption) {
      console.log('Option selected:', selectedOption);
      this.onSelect.emit(selectedOption);
      
      if (this.clearAfterSelection()) {
        // Usar requestAnimationFrame para evitar conflictos de timing
        requestAnimationFrame(() => {
          this.control().setValue('');
        });
      }
    }
  }

  onAutocompleteClick(): void {
    this.onClear.emit();
  }

  clearInput(): void {
    this.control().setValue('');
    this.onClear.emit();
  }
}