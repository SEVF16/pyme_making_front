# Guía de Integración - Módulo Admin Standalone

## 📦 Cómo Integrar en tu Aplicación

### 1. Agregar Rutas en `app.routes.ts`

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { superAdminGuard } from './guards/super-admin.guard';

export const routes: Routes = [
  // ... otras rutas

  // Módulo Admin (Solo Super Admin)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),
    canActivate: [superAdminGuard]
  },

  // ... más rutas
];
```

### 2. Crear Guard de Super Admin (Standalone)

```typescript
// src/app/guards/super-admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Obtener usuario del localStorage o servicio de autenticación
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userStr);

  // Verificar rol super-admin
  if (user.role === 'super-admin') {
    return true;
  }

  // Redirigir si no es super-admin
  router.navigate(['/unauthorized']);
  return false;
};
```

### 3. Opción con AuthService

```typescript
// src/app/guards/super-admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (user && user.role === 'super-admin') {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
```

### 4. Agregar Enlaces en el Navbar

```typescript
// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <!-- ... otros enlaces ... -->

        <!-- Link Admin (solo visible para super-admin) -->
        <ul class="navbar-nav ms-auto" *ngIf="isSuperAdmin()">
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin" routerLinkActive="active">
              <i class="fas fa-crown"></i> Admin Panel
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  isSuperAdmin(): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    return user.role === 'super-admin';
  }
}
```

### 5. Configurar Environment (si es necesario)

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // URL del backend
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.miempresa.com',
};
```

## 🔐 Flujo de Autenticación

### 1. Login de Super Admin

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        // Guardar token y usuario
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super-admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
```

### 2. Interceptor para Headers

```typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
```

### 3. Registrar Interceptor en `app.config.ts`

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## 🎯 Rutas Disponibles

Una vez integrado, estas rutas estarán disponibles:

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | Redirect → `/admin/metrics` | Ruta raíz |
| `/admin/metrics` | MetricsOverviewComponent | Métricas globales del SaaS |
| `/admin/plans` | PlansListComponent | Gestión de planes |
| `/admin/companies` | CompaniesListComponent | Listado de empresas |
| `/admin/companies/:id/dashboard` | CompanyDashboardComponent | Dashboard de empresa |

## ✅ Verificar Integración

### 1. Compilar el Proyecto

```bash
npm run build
# o
ng build
```

### 2. Ejecutar en Desarrollo

```bash
npm start
# o
ng serve
```

### 3. Verificar en Navegador

1. Abrir `http://localhost:4200`
2. Hacer login como super-admin
3. Navegar a `/admin`
4. Deberías ver las métricas globales

## 🐛 Solución de Problemas

### Error: "Cannot find module './features/admin/admin.routes'"

**Solución:** Verifica que la ruta esté correcta en `app.routes.ts`:

```typescript
loadChildren: () => import('./features/admin/admin.routes')
  .then(m => m.ADMIN_ROUTES)
```

### Error: "Guard no funciona"

**Solución:** Asegúrate de que el guard esté registrado:

```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  canActivate: [superAdminGuard] // <-- Debe estar aquí
}
```

### Error: "No se cargan los datos"

**Solución:** Verifica el interceptor y el token JWT:

1. Abre DevTools → Network
2. Verifica que las peticiones tengan el header `Authorization: Bearer {token}`
3. Verifica que el backend esté corriendo en `http://localhost:3000`

### Error: "Componente no se carga (lazy loading)"

**Solución:** Verifica que los componentes sean standalone:

```typescript
@Component({
  standalone: true, // <-- Debe ser true
  imports: [CommonModule],
  // ...
})
```

## 📚 Recursos Adicionales

- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Angular Router Guards](https://angular.io/guide/router#preventing-unauthorized-access)
- [Lazy Loading](https://angular.io/guide/lazy-loading-ngmodules)
- [HTTP Interceptors](https://angular.io/guide/http#intercepting-requests-and-responses)

---

**Última actualización:** 2025-11-22
