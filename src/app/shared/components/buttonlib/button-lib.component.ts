import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonConfig } from './interfaces/button.interface';
import { Loader2, LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-button-lib',
  standalone: true,
  imports: [LucideAngularModule, ButtonModule],
  templateUrl: './button-lib.component.html',
  styleUrl: './button-lib.component.scss'
})
export class ButtonLibComponent {
  public readonly Loader2Icon = Loader2;
 // Input signal para la configuración
  @Input() set configuration(value: ButtonConfig) {
    this.config.set(value);
  }
  
  // Output events
  @Output() buttonClick = new EventEmitter<void>();
  
  // State
  readonly config = signal<ButtonConfig>({
    variant: 'primary',
    size: 'md',
    iconPosition: 'right',
    iconSize: 16,
    type: 'button',
    disabled: false,
    loading: false,
    fullWidth: false
  });

  readonly getStyleClass = computed(() => {
    const cfg = this.config();
    const classes = [];
    
    // Ancho completo
    if (cfg.fullWidth) {
      classes.push('w-100');
    }
    
    // Clases adicionales
    if (cfg.cssClass) {
      classes.push(cfg.cssClass);
    }
    
    return classes.join(' ');
  });  
  
  readonly isOutlined = computed(() => {
    const variant = this.config().variant;
    return variant?.includes('outline') || true;
  });

  readonly isTextButton = computed(() => {
    const variant = this.config().variant;
    return variant === 'text' || variant === 'link';
  });
  // Computed properties
  readonly buttonClasses = computed(() => {
    const cfg = this.config();
    const classes = ['btn'];
    
    // Variante
    if (cfg.variant) {
      classes.push(`btn-${cfg.variant}`);
    }
    
    // Tamaño
    if (cfg.size && cfg.size !== 'md') {
      classes.push(`btn-${cfg.size}`);
    }
    
    // Ancho completo
    if (cfg.fullWidth) {
      classes.push('w-100');
    }
    
    // Estado de carga
    if (cfg.loading) {
      classes.push('btn-loading');
    }
    
    // Clases adicionales
    if (cfg.cssClass) {
      classes.push(cfg.cssClass);
    }
    
    return classes.join(' ');
  });

  readonly contentClasses = computed(() => {
    const cfg = this.config();
    const classes = [];
    
    // Gap entre icon y texto
    if (cfg.icon && cfg.text && cfg.iconPosition !== 'only') {
      classes.push('gap-2');
    }
    
    // Justificación
    if (cfg.iconPosition === 'right') {
      classes.push('flex-row-reverse');
    }
    
    return classes.join(' ');
  });

  // Event handler
  onClick(): void {

      this.buttonClick.emit();

  }
}
