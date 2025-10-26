import { AbstractControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  /**
   * Validates that the field doesn't contain only whitespace
   */
  static noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  /**
   * Enhanced email validation beyond the basic email validator
   */
  static emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value);

    return valid ? null : { invalidEmail: true };
  }

  /**
   * Phone number validation (allows international formats)
   */
  static phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Optional field
    }

    // Remove all non-numeric characters except + for country code
    const cleanPhone = control.value.replace(/[^\d+]/g, '');

    // Allow formats: +1234567890 or 1234567890 (minimum 10 digits)
    const phoneRegex = /^(\+?\d{10,15})$/;
    const valid = phoneRegex.test(cleanPhone);

    return valid ? null : { invalidPhone: true };
  }

  // Validador para contraseña fuerte (opcional, si lo necesitas después)
  static passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    
    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasNumbers = /\d/.test(control.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
    const isValid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    
    return isValid ? null : { 'weakPassword': true };
  }
}