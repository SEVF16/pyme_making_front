import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/input-text';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';

import { UserFormComponent, FormMode } from './user-form.component';
import { IUser } from '../../../interfaces/users/user-interfaces';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  const mockUser: IUser = {
    id: 'test-user-123',
    companyId: 'company-456',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    avatar: 'https://example.com/avatar.jpg',
    role: 'employee',
    status: 'active',
    permissions: 'read,write',
    emailVerified: 'true'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserFormComponent,
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        PasswordModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values in create mode', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      expect(component.userForm).toBeDefined();
      expect(component.userForm.controls.firstName.value).toBe('');
      expect(component.userForm.controls.lastName.value).toBe('');
      expect(component.userForm.controls.email.value).toBe('');
    });

    it('should set default values for role and status', () => {
      expect(component.userForm.controls.role.value).toBe('employee');
      expect(component.userForm.controls.status.value).toBe('active');
      expect(component.userForm.controls.emailVerified.value).toBe('false');
    });

    it('should set companyId when provided in create mode', () => {
      component.mode = FormMode.CREATE;
      component.companyId = 'test-company';
      component.ngOnInit();

      expect(component.userForm.controls.companyId.value).toBe('test-company');
    });
  });

  describe('Form Validation - Create Mode', () => {
    beforeEach(() => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.userForm.valid).toBeFalsy();
    });

    it('should require firstName', () => {
      const firstName = component.userForm.controls.firstName;
      expect(firstName.valid).toBeFalsy();
      expect(firstName.hasError('required')).toBeTruthy();

      firstName.setValue('John');
      expect(firstName.valid).toBeTruthy();
    });

    it('should validate firstName minimum length', () => {
      const firstName = component.userForm.controls.firstName;
      firstName.setValue('J');
      expect(firstName.hasError('minlength')).toBeTruthy();

      firstName.setValue('Jo');
      expect(firstName.hasError('minlength')).toBeFalsy();
    });

    it('should reject firstName with only whitespace', () => {
      const firstName = component.userForm.controls.firstName;
      firstName.setValue('   ');
      expect(firstName.hasError('whitespace')).toBeTruthy();

      firstName.setValue('John');
      expect(firstName.hasError('whitespace')).toBeFalsy();
    });

    it('should require valid email format', () => {
      const email = component.userForm.controls.email;

      email.setValue('invalid-email');
      expect(email.valid).toBeFalsy();

      email.setValue('test@example');
      expect(email.valid).toBeFalsy();

      email.setValue('test@example.com');
      expect(email.valid).toBeTruthy();
    });

    it('should require password in create mode', () => {
      const password = component.userForm.controls.password;
      expect(password.hasError('required')).toBeTruthy();

      password.setValue('Password123');
      expect(password.hasError('required')).toBeFalsy();
    });

    it('should validate password strength', () => {
      const password = component.userForm.controls.password;

      // Too short
      password.setValue('Pass1');
      expect(password.hasError('minlength')).toBeTruthy();

      // No uppercase
      password.setValue('password123');
      expect(password.hasError('noUppercase')).toBeTruthy();

      // No lowercase
      password.setValue('PASSWORD123');
      expect(password.hasError('noLowercase')).toBeTruthy();

      // No number
      password.setValue('PasswordABC');
      expect(password.hasError('noNumber')).toBeTruthy();

      // Valid password
      password.setValue('Password123');
      expect(password.valid).toBeTruthy();
    });

    it('should validate phone number format', () => {
      const phone = component.userForm.controls.phone;

      // Optional field - null is valid
      phone.setValue(null);
      expect(phone.valid).toBeTruthy();

      // Invalid format
      phone.setValue('123');
      expect(phone.hasError('invalidPhone')).toBeTruthy();

      // Valid format
      phone.setValue('+1234567890');
      expect(phone.valid).toBeTruthy();

      phone.setValue('1234567890');
      expect(phone.valid).toBeTruthy();
    });

    it('should be valid with all required fields filled', () => {
      component.userForm.patchValue({
        companyId: 'company-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        role: 'employee',
        status: 'active',
        permissions: 'read,write',
        emailVerified: 'true'
      });

      expect(component.userForm.valid).toBeTruthy();
    });
  });

  describe('Form Validation - Edit Mode', () => {
    beforeEach(() => {
      component.mode = FormMode.EDIT;
      component.userData = mockUser;
      component.ngOnInit();
    });

    it('should load user data', () => {
      expect(component.userForm.controls.firstName.value).toBe('John');
      expect(component.userForm.controls.lastName.value).toBe('Doe');
      expect(component.userForm.controls.email.value).toBe('john.doe@example.com');
      expect(component.userForm.controls.role.value).toBe('employee');
    });

    it('should not load password', () => {
      expect(component.userForm.controls.password.value).toBeNull();
    });

    it('should make password optional in edit mode', () => {
      const password = component.userForm.controls.password;
      expect(password.hasError('required')).toBeFalsy();
    });

    it('should still validate password if provided', () => {
      const password = component.userForm.controls.password;

      password.setValue('weak');
      expect(password.hasError('minlength')).toBeTruthy();

      password.setValue('Password123');
      expect(password.valid).toBeTruthy();
    });

    it('should make companyId readonly in edit mode', () => {
      const compiled = fixture.nativeElement;
      const companyIdInput = compiled.querySelector('#companyId');
      expect(companyIdInput.hasAttribute('readonly')).toBeTruthy();
    });
  });

  describe('Mode Switching', () => {
    it('should switch from create to edit mode', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.setMode(FormMode.EDIT, mockUser);

      expect(component.mode).toBe(FormMode.EDIT);
      expect(component.userData).toEqual(mockUser);
      expect(component.userForm.controls.firstName.value).toBe('John');
    });

    it('should switch from edit to create mode', () => {
      component.mode = FormMode.EDIT;
      component.userData = mockUser;
      component.ngOnInit();

      component.setMode(FormMode.CREATE);

      expect(component.mode).toBe(FormMode.CREATE);
      expect(component.userForm.controls.password.hasError('required')).toBeTruthy();
    });

    it('should reconfigure password validation when switching modes', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();
      let password = component.userForm.controls.password;
      expect(password.hasError('required')).toBeTruthy();

      component.setMode(FormMode.EDIT, mockUser);
      password = component.userForm.controls.password;
      expect(password.hasError('required')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should emit formSubmit with valid data in create mode', (done) => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.patchValue({
        companyId: 'company-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        phone: '+1234567890',
        role: 'employee',
        status: 'active',
        permissions: 'read,write',
        emailVerified: 'true'
      });

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.firstName).toBe('John');
        expect(userData.lastName).toBe('Doe');
        expect(userData.fullName).toBe('John Doe');
        expect(userData.email).toBe('john.doe@example.com');
        expect(userData.password).toBe('Password123');
        expect(userData.id).toBeUndefined(); // No ID in create mode
        done();
      });

      component.onSubmit();
    });

    it('should emit formSubmit with user ID in edit mode', (done) => {
      component.mode = FormMode.EDIT;
      component.userData = mockUser;
      component.ngOnInit();

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.id).toBe('test-user-123');
        expect(userData.firstName).toBe('John');
        done();
      });

      component.onSubmit();
    });

    it('should not submit if form is invalid', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      spyOn(component.formSubmit, 'emit');

      component.onSubmit();

      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.onSubmit();

      expect(component.userForm.controls.firstName.touched).toBeTruthy();
      expect(component.userForm.controls.lastName.touched).toBeTruthy();
      expect(component.userForm.controls.email.touched).toBeTruthy();
    });

    it('should exclude password if not provided in edit mode', (done) => {
      component.mode = FormMode.EDIT;
      component.userData = mockUser;
      component.ngOnInit();

      // Don't set password
      component.userForm.controls.password.setValue(null);

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.password).toBeUndefined();
        done();
      });

      component.onSubmit();
    });

    it('should include password if provided in edit mode', (done) => {
      component.mode = FormMode.EDIT;
      component.userData = mockUser;
      component.ngOnInit();

      component.userForm.controls.password.setValue('NewPassword123');

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.password).toBe('NewPassword123');
        done();
      });

      component.onSubmit();
    });

    it('should auto-generate fullName from first and last name', (done) => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.patchValue({
        companyId: 'company-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'Password123',
        role: 'manager',
        status: 'active',
        permissions: 'read,write,delete',
        emailVerified: 'true'
      });

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.fullName).toBe('Jane Smith');
        done();
      });

      component.onSubmit();
    });
  });

  describe('Form Cancellation', () => {
    it('should emit formCancel event', (done) => {
      component.formCancel.subscribe(() => {
        done();
      });

      component.onCancel();
    });

    it('should reset form on cancel', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      });

      component.onCancel();

      expect(component.userForm.controls.firstName.value).toBe('');
      expect(component.userForm.controls.lastName.value).toBe('');
      expect(component.userForm.controls.email.value).toBe('');
    });
  });

  describe('Helper Methods', () => {
    it('should return correct form title', () => {
      component.mode = FormMode.CREATE;
      expect(component.getFormTitle()).toBe('Crear Usuario');

      component.mode = FormMode.EDIT;
      expect(component.getFormTitle()).toBe('Editar Usuario');
    });

    it('should return correct submit button text', () => {
      component.mode = FormMode.CREATE;
      expect(component.getSubmitButtonText()).toBe('Crear Usuario');

      component.mode = FormMode.EDIT;
      expect(component.getSubmitButtonText()).toBe('Guardar Cambios');
    });

    it('should check if field has error', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      const firstName = component.userForm.controls.firstName;
      firstName.markAsTouched();

      expect(component.hasError('firstName')).toBeTruthy();
      expect(component.hasError('firstName', 'required')).toBeTruthy();

      firstName.setValue('John');
      expect(component.hasError('firstName')).toBeFalsy();
    });

    it('should get error message for field', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      const firstName = component.userForm.controls.firstName;
      firstName.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('Este campo es requerido');

      firstName.setValue('J');
      expect(component.getErrorMessage('firstName')).toContain('Mínimo');
    });

    it('should return empty string if field is valid', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.controls.firstName.setValue('John');
      component.userForm.controls.firstName.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('');
    });

    it('should return empty string if field is not touched', () => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      // firstName is required but not touched
      expect(component.getErrorMessage('firstName')).toBe('');
    });
  });

  describe('Form Reset', () => {
    it('should reset form to initial state', () => {
      component.mode = FormMode.CREATE;
      component.companyId = 'test-company';
      component.ngOnInit();

      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      });

      component.resetForm();

      expect(component.userForm.controls.firstName.value).toBe('');
      expect(component.userForm.controls.lastName.value).toBe('');
      expect(component.userForm.controls.email.value).toBe('');
      expect(component.userForm.controls.role.value).toBe('employee');
      expect(component.userForm.controls.status.value).toBe('active');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings in optional fields', (done) => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.patchValue({
        companyId: 'company-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        phone: '',  // Empty string
        avatar: '',  // Empty string
        role: 'employee',
        status: 'active',
        permissions: 'read',
        emailVerified: 'true'
      });

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.phone).toBeUndefined();
        expect(userData.avatar).toBeUndefined();
        done();
      });

      component.onSubmit();
    });

    it('should trim whitespace from names in fullName generation', (done) => {
      component.mode = FormMode.CREATE;
      component.ngOnInit();

      component.userForm.patchValue({
        companyId: 'company-123',
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john.doe@example.com',
        password: 'Password123',
        role: 'employee',
        status: 'active',
        permissions: 'read',
        emailVerified: 'true'
      });

      component.formSubmit.subscribe((userData: IUser) => {
        expect(userData.fullName).toBe('John Doe');
        done();
      });

      component.onSubmit();
    });

    it('should handle edit mode without user data gracefully', () => {
      component.mode = FormMode.EDIT;
      component.userData = null;

      spyOn(console, 'warn');

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalledWith('Edit mode activated but no user data provided');
    });
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
