import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputComponent } from '../../shared/components/input/input.component';
import { User } from 'lucide-angular';
import { AuthService, AuthState, LoginRequest } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    InputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  
  private destroy$ = new Subject<void>();
  
  userIcon = User;
  isLoading = signal(false);
  showPassword = signal(false);

  // Formulario actualizado con los campos requeridos por tu API
  loginForm = this.fb.group({
    email: ['admin@empresa.cl', [Validators.required, Validators.email]],
    password: ['Admin123!', [Validators.required, Validators.minLength(6)]],
    companyId: ['fbbb5649-59a9-48b7-a94f-99aac852bb5c', [Validators.required]]
  });

  ngOnInit(): void {
    // Una sola suscripción al authState para manejar redirección
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        // Actualizar loading desde el servicio
        this.isLoading.set(authState.loading);
        
        // Redirigir si ya está autenticado
        if (authState.isAuthenticated) {
          console.log('Usuario autenticado, redirigiendo...', authState.user);
          this.router.navigate(['/companies']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      // Marcar como loading localmente
      this.isLoading.set(true);
      
      const credentials: LoginRequest = {
        email: this.email?.value || '',
        password: this.password?.value || '',
        companyId: this.companyId?.value || ''
      };

      console.log('Iniciando login con:', { email: credentials.email, companyId: credentials.companyId });

      // Llamar al servicio de autenticación
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Inicio de sesión exitoso'
          });
          // La redirección se maneja en el ngOnInit
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error en el inicio de sesión'
          });
        }
      });
    } else {
      this.showFormErrors();
    }
  }

  // Métodos auxiliares para mostrar mensajes
  private showSuccessMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  private showErrorMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }

  private showFormErrors(): void {
    if (this.email?.invalid) {
      this.showErrorMessage('Error', 'Por favor ingresa un email válido');
      return;
    }
    if (this.password?.invalid) {
      this.showErrorMessage('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.companyId?.invalid) {
      this.showErrorMessage('Error', 'El ID de empresa es requerido');
      return;
    }
  }

  // Getters para acceso a los campos del formulario
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get companyId() {
    return this.loginForm.get('companyId');
  }

  // Método para testing - puedes removerlo en producción
  fillTestCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@empresa.cl',
      password: 'Admin123!',
      companyId: 'fbbb5649-59a9-48b7-a94f-99aac852bb5c'
    });
  }
}