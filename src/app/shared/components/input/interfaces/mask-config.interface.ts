
// INTERFAZ PARA LA CONFIGURACIÓN DE MÁSCARA
export interface MaskConfig {
  mask: string;
  dropSpecialCharacters?: boolean | string[];
  showMaskTyped?: boolean;
  prefix?: string;
  suffix?: string;
  specialCharacters?: string[];
  patterns?: { [key: string]: { pattern: RegExp } };
  thousandSeparator?: string;
  decimalMarker?: string;
  allowNegativeNumbers?: boolean;
  placeHolderCharacter?: string;
  shownMaskExpression?: string;
  showTemplate?: boolean;
  clearIfNotMatch?: boolean;
  validation?: boolean;
  separatorLimit?: string;
  allowNegative?: boolean;
  leadZeroDateTime?: boolean;
}