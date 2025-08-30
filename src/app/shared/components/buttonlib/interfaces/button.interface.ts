// shared/interfaces/button.interface.ts
import { LucideIconData } from 'lucide-angular';

export interface ButtonConfig {
  /** Texto del botón */
  text?: string;
  
  /** Severity de PrimeNG (primary, secondary, success, info, warning, help, danger, contrast) */
  variant?: any;
  
  /** Tamaño del botón PrimeNG (small, normal, large) */
  size?: any;
  
  /** Icono de Lucide Angular */
  icon?: LucideIconData;
  
  /** Posición del icono (left, right, only) */
  iconPosition?: string;
  
  /** Tamaño del icono */
  iconSize?: number;
  
  /** Estado deshabilitado */
  disabled?: boolean;
  
  /** Estado de carga */
  loading?: boolean;
  
  /** Tooltip del botón */
  tooltip?: string;
  
  /** Ruta para navegación (routerLink) */
  routerLink?: string;
  
  /** URL externa (href) - No soportado con p-button */
  href?: string;
  
  /** Target para enlaces externos */
  target?: string;
  
  /** Tipo de botón HTML */
  type?: string;
  
  /** Clases CSS adicionales */
  cssClass?: string;
  
  /** ID del botón */
  id?: string;
  
  /** Atributos aria para accesibilidad */
  ariaLabel?: string;
  
  /** Ancho completo */
  fullWidth?: boolean;
}