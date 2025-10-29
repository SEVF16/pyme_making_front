import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ICreateUserDto, IUser } from '../../../interfaces/users/user-interfaces';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';
import { CustomValidators } from '../../../shared/commonsUtils/common-utils-forms';

/**
 * Form mode enumeration for type safety
 */
export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit'
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    InputComponent, SelectLibComponent
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {
  // Component inputs
  @Input() mode: FormMode = FormMode.CREATE;
  @Input() userData: ICreateUserDto | null = null;
  @Input() companyId: string = '';

  // Component outputs  
  userEventChange = output<DataChangeEvent<ICreateUserDto>>();

  // Form properties
  userForm!: FormGroup;
  isSubmitting = false;

  // Expose FormMode enum to template
  readonly FormMode = FormMode;

  // Dropdown options
  readonly roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Gerente', value: 'manager' },
    { label: 'Empleado', value: 'employee' },
    { label: 'Visor', value: 'viewer' }
  ];

  readonly statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
    { label: 'Suspendido', value: 'suspended' },
    { label: 'Pendiente', value: 'pending' }
  ];

  readonly emailVerifiedOptions = [
    { label: 'Verificado', value: 'true' },
    { label: 'No verificado', value: 'false' }
  ];

  readonly sendWelcomeEmailOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];

  // Cleanup subject for subscriptions
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the reactive form with proper typing and validation
   */
private initializeForm() {
      this.userForm = this.fb.group({
      firstName: ['', [
          Validators.required, Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespaceValidator]],
      lastName: ['', [
          Validators.required, Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespaceValidator]],
      email: ['', [
          Validators.required, Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespaceValidator]],
      role: ['', [Validators.required]],
      password: [null], // ← Asegúrate de que existe
      phone: [null],
      permissions: ['', [
          Validators.required, Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespaceValidator]],
      sendWelcomeEmail: ['true']
    });
    this.setupFormListener();
  }

  private setupFormListener(): void {
    this.userForm.valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(() => {
        const dto = this.prepareFormData();
        this.userEventChange.emit({
          data: dto,
          isValid: this.userForm.valid
        });
      });
    }

  /**
   * Sets up the form based on the current mode (create/edit)
   */
  private setupFormMode(): void {
          console.log(this.mode);
    if (this.mode === FormMode.CREATE) {
      this.setupCreateMode();
    } else if (this.mode === FormMode.EDIT) {
      if (!this.userData) {
        console.warn('Edit mode activated but no user data provided');
        return;
      }

      this.loadUserData(this.userData);
    }
  }

  /**
   * Configures the form for creation mode
   * - Clears all fields
   * - Makes password required
   * - Sets companyId from input
   */
  private setupCreateMode(): void {
    // Set companyId if provided


    // Password is required in create mode
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(128),
      this.passwordStrengthValidator
    ]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  /**
   * Loads user data into the form
   * @param user - User data to load
   */
  private loadUserData(user: ICreateUserDto): void {
    console.log(user.permissions);
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions.join(', ') : user.permissions,
      sendWelcomeEmail: user.sendWelcomeEmail || null
    });

    // Don't load password for security reasons
    this.userForm.get('password')?.setValue(null);
  }


  /**
   * Resets the form to initial state
   */
  public resetForm(): void {
    this.userForm.reset();
    this.setupFormMode();
  }

  /**
   * Prepares form data for submission
   * @returns Properly formatted user data
   */
  private prepareFormData(): ICreateUserDto {
    const formValue = this.userForm.value;

    const userData: ICreateUserDto = {
      companyId: 'fbbb5649-59a9-48b7-a94f-99aac852bb5c',
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      email: formValue.email!,
      password:formValue.password!,
      role: formValue.role!,
      permissions: [formValue.permissions!],
      phone: formValue.phone || undefined,
      sendWelcomeEmail: formValue.sendWelcomeEmail || undefined
    };


    return userData;
  }

  /**
   * Marks all form controls as touched to show validation errors
   * @param formGroup - The form group to mark
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Password strength validator
   * Requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors['noNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }



}
