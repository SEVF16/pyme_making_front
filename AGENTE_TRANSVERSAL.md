# AGENTE TRANSVERSAL - PROYECTO ANGULAR FRONTEND
## Guía Estandarizada de Desarrollo

> **Versión:** 1.0.0
> **Última actualización:** 2025-11-18
> **Propósito:** Documento de referencia para mantener consistencia, calidad y escalabilidad en el desarrollo frontend

---

## 📋 TABLA DE CONTENIDOS

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Componentes Transversales](#componentes-transversales)
3. [Servicios Transversales](#servicios-transversales)
4. [Elementos Arquitecturales](#elementos-arquitecturales)
5. [Buenas Prácticas Obligatorias](#buenas-prácticas-obligatorias)
6. [Guía para Crear Nuevos Componentes](#guía-para-crear-nuevos-componentes)
7. [Checklist Pre-Desarrollo](#checklist-pre-desarrollo)
8. [Estándares de Código](#estándares-de-código)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Estructura Recomendada

```
src/
├── app/
│   ├── core/                    # Módulo core (singleton)
│   │   ├── guards/              # Guards de autenticación y autorización
│   │   ├── interceptors/        # HTTP Interceptors
│   │   ├── services/            # Servicios singleton
│   │   ├── models/              # Modelos de dominio
│   │   └── core.module.ts
│   │
│   ├── shared/                  # Módulo compartido (reutilizable)
│   │   ├── components/          # Componentes reutilizables
│   │   ├── directives/          # Directivas personalizadas
│   │   ├── pipes/               # Pipes personalizados
│   │   ├── validators/          # Validadores customizados
│   │   └── shared.module.ts
│   │
│   ├── features/                # Módulos de funcionalidades
│   │   ├── auth/                # Autenticación
│   │   ├── dashboard/           # Dashboard
│   │   ├── users/               # Gestión de usuarios
│   │   └── [feature]/           # Otras features
│   │       ├── components/
│   │       ├── services/
│   │       ├── models/
│   │       └── [feature].module.ts
│   │
│   ├── layout/                  # Componentes de layout
│   │   ├── header/
│   │   ├── footer/
│   │   ├── sidebar/
│   │   └── layout.module.ts
│   │
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/                      # Recursos estáticos
│   ├── images/
│   ├── icons/
│   ├── i18n/                    # Archivos de internacionalización
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       └── _utilities.scss
│
├── environments/                # Configuraciones de entorno
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles.scss                  # Estilos globales
```

### Principios de Organización

1. **Core Module:**
   - Importado UNA SOLA VEZ en AppModule
   - Contiene servicios singleton (AuthService, HttpService, etc.)
   - Incluye guards e interceptors

2. **Shared Module:**
   - Importado en cada feature module que lo necesite
   - Contiene componentes, pipes y directives reutilizables
   - NO debe tener servicios (usar providedIn: 'root')

3. **Feature Modules:**
   - Lazy loading cuando sea posible
   - Auto-contenidos y con alta cohesión
   - Mínima dependencia entre features

4. **Layout Module:**
   - Componentes de estructura visual
   - Header, Footer, Sidebar, Navigation
   - Importado en el nivel de aplicación

---

## 🧩 COMPONENTES TRANSVERSALES

### 1. Modal Component

**Ubicación:** `src/app/shared/components/modal/`

**Propósito:**
Componente reutilizable para mostrar diálogos modales en toda la aplicación.

**Cuándo utilizarlo:**
- Confirmaciones de acciones
- Formularios en overlay
- Mensajes informativos o de alerta
- Visualización de detalles

**Estructura de archivos:**
```
modal/
├── modal.component.ts
├── modal.component.html
├── modal.component.scss
└── modal.component.spec.ts
```

**Ejemplo de implementación:**

```typescript
// modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closeModal.emit();
  }
}
```

```html
<!-- modal.component.html -->
<div class="modal-overlay" *ngIf="isOpen" (click)="close()">
  <div class="modal-content" [ngClass]="'modal-' + size" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <h2>{{ title }}</h2>
      <button class="close-btn" (click)="close()">&times;</button>
    </div>
    <div class="modal-body">
      <ng-content></ng-content>
    </div>
  </div>
</div>
```

**Uso en otros componentes:**

```typescript
// Componente padre
export class ParentComponent {
  isModalOpen = false;

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}
```

```html
<!-- Template del componente padre -->
<button (click)="openModal()">Abrir Modal</button>

<app-modal
  [title]="'Confirmación'"
  [isOpen]="isModalOpen"
  (closeModal)="closeModal()">
  <p>¿Estás seguro de realizar esta acción?</p>
  <button (click)="closeModal()">Cancelar</button>
</app-modal>
```

---

### 2. Loader Component

**Ubicación:** `src/app/shared/components/loader/`

**Propósito:**
Indicador visual de carga para operaciones asíncronas.

**Cuándo utilizarlo:**
- Llamadas HTTP
- Procesamiento de datos
- Cualquier operación que requiera espera

**Ejemplo de implementación:**

```typescript
// loader.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Cargando...';
  @Input() overlay: boolean = true;
}
```

```html
<!-- loader.component.html -->
<div *ngIf="isLoading" [ngClass]="{'loader-overlay': overlay}">
  <div class="loader-container">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</div>
```

**Uso:**

```html
<app-loader [isLoading]="isLoading" [message]="'Procesando datos...'"></app-loader>
```

---

### 3. Notification/Toast Component

**Ubicación:** `src/app/shared/components/notification/`

**Propósito:**
Mostrar mensajes de éxito, error, advertencia o información al usuario.

**Cuándo utilizarlo:**
- Feedback de operaciones CRUD
- Mensajes de error de validación
- Confirmaciones de acciones

**Ejemplo de implementación:**

```typescript
// notification.component.ts
import { Component } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}
}
```

```typescript
// notification.service.ts (en core/services)
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  show(notification: Notification): void {
    this.notificationSubject.next(notification);
  }

  success(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.show({ type: 'info', message, duration });
  }
}
```

**Uso:**

```typescript
constructor(private notificationService: NotificationService) {}

saveData(): void {
  this.userService.save(this.userData).subscribe({
    next: () => this.notificationService.success('Datos guardados exitosamente'),
    error: () => this.notificationService.error('Error al guardar los datos')
  });
}
```

---

### 4. Tabla/DataTable Component

**Ubicación:** `src/app/shared/components/data-table/`

**Propósito:**
Componente para visualizar datos en formato tabular con paginación, ordenamiento y filtrado.

**Cuándo utilizarlo:**
- Listados de información
- Reportes
- Gestión de datos (CRUD)

**Características:**
- Paginación
- Ordenamiento por columnas
- Filtrado
- Acciones por fila
- Selección múltiple

**Ejemplo básico:**

```typescript
// data-table.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T> {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() pageSize: number = 10;
  @Output() rowClick = new EventEmitter<T>();

  currentPage = 1;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  get paginatedData(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  sort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    // Implementar lógica de ordenamiento
  }
}
```

---

### 5. Form Components

**Ubicación:** `src/app/shared/components/forms/`

**Componentes incluidos:**
- `input-field/` - Campo de texto reutilizable
- `select-field/` - Selector dropdown
- `checkbox-field/` - Checkbox
- `radio-field/` - Radio button
- `date-picker/` - Selector de fecha

**Propósito:**
Componentes de formulario consistentes y validados en toda la aplicación.

**Ejemplo: Input Field Component**

```typescript
// input-field.component.ts
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputFieldComponent),
    multi: true
  }]
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() errorMessage: string = '';

  value: string = '';
  disabled: boolean = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
```

```html
<!-- input-field.component.html -->
<div class="form-field">
  <label *ngIf="label">{{ label }}</label>
  <input
    [type]="type"
    [placeholder]="placeholder"
    [value]="value"
    [disabled]="disabled"
    (input)="onInputChange($event)"
    (blur)="onTouched()">
  <span class="error-message" *ngIf="errorMessage">{{ errorMessage }}</span>
</div>
```

**Uso:**

```html
<form [formGroup]="myForm">
  <app-input-field
    formControlName="email"
    [label]="'Correo Electrónico'"
    [type]="'email'"
    [errorMessage]="getErrorMessage('email')">
  </app-input-field>
</form>
```

---

### 6. Card Component

**Ubicación:** `src/app/shared/components/card/`

**Propósito:**
Contenedor visual reutilizable para agrupar información.

**Ejemplo:**

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="card" [ngClass]="cardClass">
      <div class="card-header" *ngIf="title">
        <h3>{{ title }}</h3>
        <ng-content select="[card-actions]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title: string = '';
  @Input() cardClass: string = '';
  @Input() hasFooter: boolean = false;
}
```

---

## 🔧 SERVICIOS TRANSVERSALES

### 1. AuthService

**Ubicación:** `src/app/core/services/auth.service.ts`

**Responsabilidades:**
- Manejo de autenticación (login/logout)
- Gestión de tokens
- Verificación de permisos
- Estado de sesión

**Ejemplo:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private setSession(authResult: any): void {
    localStorage.setItem('access_token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  private loadStoredUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }
}
```

---

### 2. HttpService

**Ubicación:** `src/app/core/services/http.service.ts`

**Responsabilidades:**
- Wrapper para peticiones HTTP
- Manejo centralizado de errores
- Configuración de headers
- Logging de peticiones

**Ejemplo:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, options)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, options)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

---

### 3. StorageService

**Ubicación:** `src/app/core/services/storage.service.ts`

**Responsabilidades:**
- Abstracción de localStorage/sessionStorage
- Serialización/deserialización automática
- Manejo de expiración de datos

**Ejemplo:**

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
```

---

### 4. LoggerService

**Ubicación:** `src/app/core/services/logger.service.ts`

**Responsabilidades:**
- Logging centralizado
- Diferentes niveles (info, warn, error)
- Envío de logs a servidor (producción)

**Ejemplo:**

```typescript
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  debug(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.DEBUG, message, optionalParams);
  }

  info(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.INFO, message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.WARN, message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.ERROR, message, optionalParams);
  }

  private log(level: LogLevel, message: string, params: any[]): void {
    if (level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${LogLevel[level]}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(logMessage, ...params);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, ...params);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, ...params);
        // Enviar a servidor en producción
        if (environment.production) {
          this.sendToServer(level, message, params);
        }
        break;
    }
  }

  private sendToServer(level: LogLevel, message: string, params: any[]): void {
    // Implementar envío de logs al servidor
  }
}
```

---

### 5. ValidationService

**Ubicación:** `src/app/core/services/validation.service.ts`

**Responsabilidades:**
- Validadores customizados reutilizables
- Mensajes de error consistentes

**Ejemplo:**

```typescript
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLengthValid = value.length >= 8;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;

      return passwordValid ? null : {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecialChar,
          isLengthValid
        }
      };
    };
  }

  static matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { matching: true };
    };
  }

  getErrorMessage(controlName: string, errors: ValidationErrors | null): string {
    if (!errors) return '';

    const errorMessages: { [key: string]: string } = {
      required: `${controlName} es requerido`,
      email: 'Correo electrónico inválido',
      invalidEmail: 'Correo electrónico inválido',
      minlength: `${controlName} debe tener al menos ${errors['minlength']?.requiredLength} caracteres`,
      maxlength: `${controlName} debe tener máximo ${errors['maxlength']?.requiredLength} caracteres`,
      matching: 'Los valores no coinciden',
      passwordStrength: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
    };

    const firstError = Object.keys(errors)[0];
    return errorMessages[firstError] || 'Error de validación';
  }
}
```

---

## 🛡️ ELEMENTOS ARQUITECTURALES

### Guards

**Ubicación:** `src/app/core/guards/`

#### 1. AuthGuard

**Propósito:** Proteger rutas que requieren autenticación

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
```

**Uso en routing:**

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

---

#### 2. RoleGuard

**Propósito:** Proteger rutas por roles de usuario

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRole = route.data['role'];

    if (this.authService.hasRole(requiredRole)) {
      return true;
    }

    return this.router.createUrlTree(['/unauthorized']);
  }
}
```

**Uso:**

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'admin' }
}
```

---

### Interceptors

**Ubicación:** `src/app/core/interceptors/`

#### 1. AuthInterceptor

**Propósito:** Añadir token de autenticación a todas las peticiones

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

---

#### 2. ErrorInterceptor

**Propósito:** Manejo centralizado de errores HTTP

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';

        if (error.status === 401) {
          errorMessage = 'No autorizado';
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          errorMessage = 'Acceso denegado';
        } else if (error.status === 404) {
          errorMessage = 'Recurso no encontrado';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor';
        }

        this.notificationService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

**Registro en AppModule:**

```typescript
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
]
```

---

#### 3. LoadingInterceptor

**Propósito:** Mostrar/ocultar indicador de carga global

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
```

---

### Pipes

**Ubicación:** `src/app/shared/pipes/`

#### 1. SafeHtmlPipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.sanitize(1, value) || '';
  }
}
```

---

#### 2. TruncatePipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
```

---

#### 3. TimeAgoPipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return interval === 1
          ? `Hace 1 ${name}`
          : `Hace ${interval} ${name}s`;
      }
    }

    return 'Justo ahora';
  }
}
```

---

### Directives

**Ubicación:** `src/app/shared/directives/`

#### 1. ClickOutsideDirective

```typescript
import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
```

---

#### 2. HighlightDirective

```typescript
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input() highlightColor = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter(): void {
    this.highlight(this.highlightColor);
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.highlight('');
  }

  private highlight(color: string): void {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

---

## ✅ BUENAS PRÁCTICAS OBLIGATORIAS

### 1. Principios SOLID

#### **S - Single Responsibility Principle (SRP)**

Cada clase/componente debe tener una única responsabilidad.

**❌ MAL:**
```typescript
// Componente hace demasiado
export class UserComponent {
  getUsers() { /* llamada HTTP */ }
  validateUser() { /* lógica de negocio */ }
  formatDate() { /* formateo */ }
  saveToLocalStorage() { /* persistencia */ }
}
```

**✅ BIEN:**
```typescript
// Componente solo maneja la vista
export class UserComponent {
  constructor(
    private userService: UserService,
    private validationService: ValidationService,
    private storageService: StorageService
  ) {}
}

// Servicio maneja la lógica de negocio
export class UserService {
  getUsers(): Observable<User[]> { }
  validateUser(user: User): boolean { }
}
```

---

#### **O - Open/Closed Principle (OCP)**

Abierto para extensión, cerrado para modificación.

**✅ BIEN:**
```typescript
// Interface base
export interface PaymentMethod {
  processPayment(amount: number): Observable<any>;
}

// Implementaciones específicas
export class CreditCardPayment implements PaymentMethod {
  processPayment(amount: number): Observable<any> { }
}

export class PayPalPayment implements PaymentMethod {
  processPayment(amount: number): Observable<any> { }
}

// Servicio que usa la abstracción
export class PaymentService {
  process(method: PaymentMethod, amount: number): Observable<any> {
    return method.processPayment(amount);
  }
}
```

---

#### **L - Liskov Substitution Principle (LSP)**

Las clases derivadas deben poder sustituir a sus clases base.

---

#### **I - Interface Segregation Principle (ISP)**

Interfaces específicas mejor que una general.

**❌ MAL:**
```typescript
interface Animal {
  fly(): void;
  swim(): void;
  walk(): void;
}
```

**✅ BIEN:**
```typescript
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

interface Walkable {
  walk(): void;
}

class Bird implements Flyable, Walkable {
  fly(): void { }
  walk(): void { }
}
```

---

#### **D - Dependency Inversion Principle (DIP)**

Depender de abstracciones, no de implementaciones concretas.

**✅ BIEN:**
```typescript
// Interfaz (abstracción)
export interface IDataService {
  getData(): Observable<any>;
}

// Componente depende de la abstracción
export class MyComponent {
  constructor(private dataService: IDataService) {}
}
```

---

### 2. Clean Code

#### **Nombres significativos**

**❌ MAL:**
```typescript
const d: number; // días
const u: User[];
function calc() { }
```

**✅ BIEN:**
```typescript
const daysUntilExpiration: number;
const activeUsers: User[];
function calculateTotalPrice() { }
```

---

#### **Funciones pequeñas y enfocadas**

**❌ MAL:**
```typescript
function processUser(user: User): void {
  // Validación (20 líneas)
  // Transformación (30 líneas)
  // Guardado (15 líneas)
  // Notificación (10 líneas)
  // Logging (5 líneas)
}
```

**✅ BIEN:**
```typescript
function processUser(user: User): void {
  const validatedUser = this.validateUser(user);
  const transformedUser = this.transformUser(validatedUser);
  this.saveUser(transformedUser);
  this.notifyUser(transformedUser);
  this.logUserCreation(transformedUser);
}

private validateUser(user: User): User { }
private transformUser(user: User): User { }
private saveUser(user: User): void { }
private notifyUser(user: User): void { }
private logUserCreation(user: User): void { }
```

---

#### **DRY (Don't Repeat Yourself)**

**❌ MAL:**
```typescript
getActiveUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users')
    .pipe(
      retry(3),
      catchError(error => {
        console.error('Error:', error);
        return throwError(() => error);
      })
    );
}

getInactiveUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users/inactive')
    .pipe(
      retry(3),
      catchError(error => {
        console.error('Error:', error);
        return throwError(() => error);
      })
    );
}
```

**✅ BIEN:**
```typescript
private handleRequest<T>(url: string): Observable<T> {
  return this.http.get<T>(url).pipe(
    retry(3),
    catchError(this.handleError)
  );
}

getActiveUsers(): Observable<User[]> {
  return this.handleRequest<User[]>('/api/users');
}

getInactiveUsers(): Observable<User[]> {
  return this.handleRequest<User[]>('/api/users/inactive');
}
```

---

#### **Comentarios útiles**

**❌ MAL:**
```typescript
// Incrementa i
i++;

// Loop sobre usuarios
for (const user of users) { }
```

**✅ BIEN:**
```typescript
// Algoritmo de Luhn para validar número de tarjeta
function validateCreditCard(number: string): boolean { }

/**
 * Calcula el precio con descuento aplicando reglas de negocio:
 * - 10% para compras > $100
 * - 15% para compras > $500
 * - 20% para miembros premium
 */
function calculateDiscountedPrice(price: number, isPremium: boolean): number { }
```

---

### 3. Angular Best Practices

#### **OnPush Change Detection**

```typescript
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() users: User[] = [];
}
```

---

#### **Unsubscribe de Observables**

**✅ OPCIÓN 1: AsyncPipe (RECOMENDADO)**
```typescript
export class UserComponent {
  users$ = this.userService.getUsers();
}
```

```html
<div *ngFor="let user of users$ | async">
  {{ user.name }}
</div>
```

**✅ OPCIÓN 2: takeUntilDestroyed (Angular 16+)**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class UserComponent {
  constructor(private userService: UserService) {
    this.userService.getUsers()
      .pipe(takeUntilDestroyed())
      .subscribe(users => this.users = users);
  }
}
```

**✅ OPCIÓN 3: Subject + takeUntil**
```typescript
export class UserComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => this.users = users);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

#### **Lazy Loading**

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  }
];
```

---

#### **TrackBy en ngFor**

**❌ MAL:**
```html
<div *ngFor="let user of users">
  {{ user.name }}
</div>
```

**✅ BIEN:**
```html
<div *ngFor="let user of users; trackBy: trackByUserId">
  {{ user.name }}
</div>
```

```typescript
trackByUserId(index: number, user: User): number {
  return user.id;
}
```

---

#### **Evitar lógica en templates**

**❌ MAL:**
```html
<div>
  {{ user.firstName + ' ' + user.lastName + ' (' + user.age + ' años)' }}
</div>
```

**✅ BIEN:**
```typescript
get fullUserInfo(): string {
  return `${this.user.firstName} ${this.user.lastName} (${this.user.age} años)`;
}
```

```html
<div>{{ fullUserInfo }}</div>
```

---

### 4. Arquitectura Escalable

#### **Feature Modules**

Cada feature debe ser auto-contenida:

```
features/users/
├── components/
│   ├── user-list/
│   ├── user-detail/
│   └── user-form/
├── services/
│   └── user.service.ts
├── models/
│   └── user.model.ts
├── users-routing.module.ts
└── users.module.ts
```

---

#### **Barrel Exports (index.ts)**

```typescript
// shared/components/index.ts
export * from './modal/modal.component';
export * from './loader/loader.component';
export * from './card/card.component';

// Uso
import { ModalComponent, LoaderComponent, CardComponent } from '@shared/components';
```

---

#### **Path Aliases en tsconfig.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

**Uso:**
```typescript
import { AuthService } from '@core/services/auth.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
```

---

### 5. Modularidad y Alta Cohesión

- Componentes relacionados en el mismo módulo
- Servicios específicos de feature en el módulo de feature
- Servicios globales en CoreModule
- Componentes reutilizables en SharedModule
- NO importar SharedModule en CoreModule
- NO importar CoreModule en features (usar providedIn: 'root')

---

### 6. Testing

#### **Componente**

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);

    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    const mockUsers: User[] = [{ id: 1, name: 'Test User' }];
    userService.getUsers.and.returnValue(of(mockUsers));

    component.ngOnInit();

    expect(component.users).toEqual(mockUsers);
  });
});
```

---

#### **Servicio**

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login successfully', () => {
    const mockResponse = { token: 'fake-token', user: { id: 1, name: 'Test' } };

    service.login('test@test.com', 'password').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

---

## 🚀 GUÍA PARA CREAR NUEVOS COMPONENTES

### Estructura Estándar de un Componente

```
my-component/
├── my-component.component.ts       # Lógica del componente
├── my-component.component.html     # Template
├── my-component.component.scss     # Estilos
├── my-component.component.spec.ts  # Tests
└── index.ts                        # Barrel export (opcional)
```

---

### Template de Componente

```typescript
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponentComponent implements OnInit {
  // Inputs
  @Input() data: any;

  // Outputs
  @Output() dataChange = new EventEmitter<any>();

  // Variables públicas
  public displayData: any;

  // Variables privadas
  private internalState: any;

  constructor(
    private myService: MyService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Métodos públicos
  public loadData(): void {
    // Implementación
  }

  // Métodos privados
  private processData(): void {
    // Implementación
  }

  // Getters
  get computedValue(): string {
    return this.calculateValue();
  }

  // Event handlers
  onButtonClick(): void {
    this.dataChange.emit(this.data);
  }

  // TrackBy functions
  trackById(index: number, item: any): number {
    return item.id;
  }
}
```

---

### Comandos CLI

```bash
# Generar componente
ng generate component features/users/components/user-list

# Generar componente en shared (sin spec)
ng generate component shared/components/modal --skip-tests

# Generar servicio
ng generate service core/services/auth

# Generar guard
ng generate guard core/guards/auth

# Generar pipe
ng generate pipe shared/pipes/truncate

# Generar directive
ng generate directive shared/directives/click-outside

# Generar module
ng generate module features/users --routing

# Generar interface
ng generate interface core/models/user
```

---

## 📝 CHECKLIST PRE-DESARROLLO

Antes de crear un nuevo componente/servicio, verifica:

### ✅ Análisis de Requisitos

- [ ] **¿Qué problema resuelve?**
- [ ] **¿Ya existe algo similar que pueda reutilizar?**
  - Revisar `src/app/shared/components/`
  - Revisar `src/app/core/services/`
  - Buscar en la documentación del proyecto
- [ ] **¿Dónde debe vivir este componente?**
  - `shared/` si es reutilizable en múltiples features
  - `features/[feature]/` si es específico de una funcionalidad
  - `layout/` si es parte de la estructura visual global

---

### ✅ Diseño

- [ ] **¿Necesita estado?**
  - Local: usar variables en el componente
  - Compartido: usar servicio o state management
- [ ] **¿Necesita comunicación con otros componentes?**
  - Padre → Hijo: usar `@Input()`
  - Hijo → Padre: usar `@Output()` con `EventEmitter`
  - No relacionados: usar servicio compartido o state management
- [ ] **¿Tiene dependencias?**
  - Inyectar servicios necesarios
  - Verificar que estén disponibles en el módulo correcto

---

### ✅ Implementación

- [ ] **Seguir la estructura estándar**
- [ ] **Aplicar principios SOLID**
- [ ] **Código limpio y legible**
- [ ] **Nombres descriptivos**
- [ ] **Funciones pequeñas y enfocadas**
- [ ] **Implementar OnPush si es posible**
- [ ] **Usar trackBy en ngFor**
- [ ] **Gestionar correctamente observables**
- [ ] **Agregar validaciones necesarias**

---

### ✅ Testing

- [ ] **Escribir tests unitarios**
- [ ] **Cobertura mínima del 80%**
- [ ] **Casos edge cubiertos**

---

### ✅ Documentación

- [ ] **Comentarios JSDoc en funciones públicas**
- [ ] **README si es componente complejo**
- [ ] **Actualizar AGENTE_TRANSVERSAL.md si es reutilizable**

---

### ✅ Revisión

- [ ] **Ejecutar linter: `npm run lint`**
- [ ] **Ejecutar tests: `npm run test`**
- [ ] **Verificar que build funcione: `npm run build`**
- [ ] **Revisar que no haya console.log olvidados**
- [ ] **Verificar imports optimizados**

---

## 📐 ESTÁNDARES DE CÓDIGO

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase + Component | `UserListComponent` |
| Servicios | PascalCase + Service | `AuthService` |
| Interfaces | PascalCase (prefijo I opcional) | `User` o `IUser` |
| Tipos | PascalCase + Type | `UserType` |
| Enums | PascalCase | `UserRole` |
| Variables | camelCase | `userData` |
| Constantes | UPPER_SNAKE_CASE | `API_URL` |
| Métodos privados | camelCase con _ | `_processData()` o `processData()` |
| Archivos | kebab-case | `user-list.component.ts` |

---

### Organización de Imports

```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// 2. RxJS
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

// 3. Librerías de terceros
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// 4. Servicios y modelos del proyecto
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

// 5. Componentes
import { ModalComponent } from '@shared/components/modal/modal.component';
```

---

### Estructura de Clases

```typescript
export class MyComponent implements OnInit, OnDestroy {
  // 1. Propiedades decoradas
  @Input() data: any;
  @Output() change = new EventEmitter();
  @ViewChild('template') template: TemplateRef<any>;

  // 2. Propiedades públicas
  public users: User[] = [];
  public isLoading = false;

  // 3. Propiedades privadas
  private destroy$ = new Subject<void>();

  // 4. Constructor
  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  // 5. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 6. Getters/Setters
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // 7. Métodos públicos
  public loadData(): void {
    // Implementación
  }

  // 8. Event handlers
  onClick(): void {
    // Implementación
  }

  // 9. Métodos privados
  private processData(): void {
    // Implementación
  }
}
```

---

### Reglas de Estilo SCSS

```scss
// Usar BEM (Block Element Modifier)
.user-card {
  padding: 1rem;

  &__header {
    font-weight: bold;
  }

  &__body {
    margin-top: 0.5rem;
  }

  &--highlighted {
    background-color: yellow;
  }
}

// Variables en _variables.scss
$primary-color: #007bff;
$font-size-base: 1rem;

// Usar variables
.button {
  background-color: $primary-color;
  font-size: $font-size-base;
}

// Evitar !important
// Usar especificidad correcta en su lugar
```

---

## 📚 EJEMPLOS DE IMPLEMENTACIÓN

### Ejemplo 1: CRUD Completo

```typescript
// user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

```typescript
// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]>;
  isLoading = false;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.users$ = this.userService.getAll();
    this.isLoading = false;
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado');
          this.loadUsers();
        },
        error: () => {
          this.notificationService.error('Error al eliminar usuario');
        }
      });
    }
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

```html
<!-- user-list.component.html -->
<div class="user-list">
  <h2>Usuarios</h2>

  <app-loader [isLoading]="isLoading"></app-loader>

  <div *ngIf="users$ | async as users" class="user-list__content">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users; trackBy: trackByUserId">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button (click)="deleteUser(user.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### Ejemplo 2: Formulario Reactivo con Validaciones

```typescript
// user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { ValidationService } from '@core/services/validation.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, ValidationService.emailValidator()]],
      password: ['', [Validators.required, ValidationService.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const userData = this.userForm.value;

    this.userService.create(userData).subscribe({
      next: () => {
        this.notificationService.success('Usuario creado exitosamente');
        this.userForm.reset();
      },
      error: () => {
        this.notificationService.error('Error al crear usuario');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    return this.validationService.getErrorMessage(controlName, control?.errors || null);
  }

  get f() {
    return this.userForm.controls;
  }
}
```

```html
<!-- user-form.component.html -->
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label for="name">Nombre</label>
    <input
      id="name"
      type="text"
      formControlName="name"
      [class.is-invalid]="f['name'].invalid && f['name'].touched">
    <div class="error-message" *ngIf="f['name'].invalid && f['name'].touched">
      {{ getErrorMessage('name') }}
    </div>
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      formControlName="email"
      [class.is-invalid]="f['email'].invalid && f['email'].touched">
    <div class="error-message" *ngIf="f['email'].invalid && f['email'].touched">
      {{ getErrorMessage('email') }}
    </div>
  </div>

  <div class="form-group">
    <label for="password">Contraseña</label>
    <input
      id="password"
      type="password"
      formControlName="password"
      [class.is-invalid]="f['password'].invalid && f['password'].touched">
    <div class="error-message" *ngIf="f['password'].invalid && f['password'].touched">
      {{ getErrorMessage('password') }}
    </div>
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirmar Contraseña</label>
    <input
      id="confirmPassword"
      type="password"
      formControlName="confirmPassword"
      [class.is-invalid]="f['confirmPassword'].invalid && f['confirmPassword'].touched">
    <div class="error-message" *ngIf="userForm.errors?.['passwordMismatch'] && f['confirmPassword'].touched">
      Las contraseñas no coinciden
    </div>
  </div>

  <button type="submit" [disabled]="userForm.invalid || isSubmitting">
    {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
  </button>
</form>
```

---

### Ejemplo 3: State Management con BehaviorSubject

```typescript
// user-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@core/models/user.model';

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private state = new BehaviorSubject<UserState>(initialState);
  public state$ = this.state.asObservable();

  // Selectores
  get users$(): Observable<User[]> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.users));
    });
  }

  get selectedUser$(): Observable<User | null> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.selectedUser));
    });
  }

  get isLoading$(): Observable<boolean> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.isLoading));
    });
  }

  // Acciones
  setUsers(users: User[]): void {
    this.updateState({ users });
  }

  selectUser(user: User | null): void {
    this.updateState({ selectedUser: user });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  addUser(user: User): void {
    const currentUsers = this.state.value.users;
    this.updateState({ users: [...currentUsers, user] });
  }

  updateUser(updatedUser: User): void {
    const users = this.state.value.users.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.updateState({ users });
  }

  removeUser(id: number): void {
    const users = this.state.value.users.filter(user => user.id !== id);
    this.updateState({ users });
  }

  private updateState(partial: Partial<UserState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }

  reset(): void {
    this.state.next(initialState);
  }
}
```

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

1. **Planificación**
   - Analizar requisitos
   - Verificar reutilización
   - Diseñar arquitectura

2. **Desarrollo**
   - Crear estructura
   - Implementar lógica
   - Aplicar estilos

3. **Testing**
   - Tests unitarios
   - Tests de integración

4. **Revisión**
   - Code review
   - Refactoring
   - Documentación

5. **Deploy**
   - Build
   - Verificación
   - Deploy

---

## 📞 RECURSOS Y AYUDA

### Comandos útiles

```bash
# Desarrollo
npm start                # Iniciar servidor de desarrollo
npm run build            # Build de producción
npm run build:prod       # Build optimizado
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run lint             # Ejecutar linter
npm run lint:fix         # Linter con auto-fix

# Generación de código
ng generate component [name]
ng generate service [name]
ng generate module [name]
ng generate guard [name]
ng generate pipe [name]
ng generate directive [name]
```

---

### Estructura de Commits

```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Formateo, punto y coma, etc (no cambios de código)
refactor: Refactorización de código
test: Agregar tests
chore: Mantenimiento, dependencias, etc
```

**Ejemplo:**
```
feat(users): add user list pagination
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

---

## 🔄 MANTENIMIENTO DEL DOCUMENTO

Este documento debe actualizarse cuando:

- Se agreguen nuevos componentes transversales
- Se modifiquen servicios core
- Cambien las prácticas del equipo
- Se adopten nuevas tecnologías
- Se identifiquen patterns recurrentes

**Responsable:** Tech Lead / Arquitecto de Software

---

## 📌 CONCLUSIÓN

Este documento es una **guía viva** que debe evolucionar con el proyecto. Su propósito es:

✅ Mantener consistencia en el código
✅ Facilitar onboarding de nuevos desarrolladores
✅ Promover buenas prácticas
✅ Escalar el proyecto de manera ordenada
✅ Reducir deuda técnica

**Recuerda:** Antes de escribir código nuevo, pregúntate si ya existe algo reutilizable. El mejor código es el que no tienes que escribir.

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-18
**Autor:** Equipo de Desarrollo
