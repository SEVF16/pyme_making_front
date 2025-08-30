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
  userIcon = User;
  isLoading = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    // if (this.loginForm.valid) {
    //   this.isLoading.set(true);
      
    //   const { username, password } = this.loginForm.value;
      
    //   this.authService.login(username!, password!).subscribe({
    //     next: (response) => {
    //       this.isLoading.set(false);
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Éxito',
    //         detail: 'Inicio de sesión exitoso'
    //       });
          
    //       // Redirigir al dashboard o página principal
    //       setTimeout(() => {
    //         this.router.navigate(['/dashboard']);
    //       }, 1500);
    //     },
    //     error: (error) => {
    //       this.isLoading.set(false);
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         detail: error.message || 'Error en el inicio de sesión'
    //       });
    //     }
    //   });
    // } else {
    //   // Marcar todos los campos como touched para mostrar errores
    //   this.loginForm.markAllAsTouched();
    // }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}