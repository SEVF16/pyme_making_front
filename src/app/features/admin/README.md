# Módulo Admin - Frontend Angular (Standalone)

## 📋 Descripción

Módulo completo standalone para la gestión administrativa del sistema SaaS. Permite a usuarios con rol **Super Admin** gestionar planes de suscripción, empresas (tenants), suscripciones y visualizar métricas globales del sistema.

**Arquitectura:** Angular 18+ Standalone Components

## 🗂️ Estructura del Módulo

```
src/app/features/admin/
├── components/
│   ├── plans/
│   │   ├── plans-list.component.ts (standalone)
│   │   ├── plans-list.component.html
│   │   └── plans-list.component.css
│   │
│   ├── companies/
│   │   ├── companies-list.component.ts (standalone)
│   │   ├── companies-list.component.html
│   │   ├── companies-list.component.css
│   │   ├── company-dashboard.component.ts (standalone)
│   │   ├── company-dashboard.component.html
│   │   └── company-dashboard.component.css
│   │
│   └── metrics/
│       ├── metrics-overview.component.ts (standalone)
│       ├── metrics-overview.component.html
│       └── metrics-overview.component.css
│
├── admin.routes.ts (Routes standalone)
└── README.md
```

## 🚀 Características de Standalone

### ✅ Componentes Standalone
Todos los componentes usan `standalone: true`:

```typescript
@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans-list.component.html',
  styleUrls: ['./plans-list.component.css']
})
export class PlansListComponent { }
```

### ✅ Lazy Loading con Rutas Standalone
```typescript
// admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  {
    path: 'metrics',
    loadComponent: () => import('./components/metrics/metrics-overview.component')
      .then(m => m.MetricsOverviewComponent)
  }
];
```

### ✅ Sin NgModule
- ❌ No hay `admin.module.ts`
- ❌ No hay `declarations`
- ✅ Cada componente importa sus propias dependencias
- ✅ Lazy loading optimizado

## 📦 Cómo Integrar al Proyecto

### 1. **Agregar rutas en App Routing**

#### Opción A: app.routes.ts (standalone)
```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [SuperAdminGuard]
  }
];
```

#### Opción B: app-routing.module.ts (módulos tradicionales)
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.default),
    canActivate: [SuperAdminGuard]
  }
];
```

### 2. **Crear Guard de Super Admin (Standalone)**

```typescript
// guards/super-admin.guard.ts
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

### 3. **Usar en Rutas**

```typescript
// app.routes.ts
import { superAdminGuard } from './guards/super-admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [superAdminGuard] // Function guard, no clase
  }
];
```

## 🎯 Rutas Disponibles

| Ruta | Componente | Lazy Loading |
|------|-----------|--------------|
| `/admin` | Redirect a `/admin/metrics` | - |
| `/admin/metrics` | MetricsOverviewComponent | ✅ |
| `/admin/plans` | PlansListComponent | ✅ |
| `/admin/companies` | CompaniesListComponent | ✅ |
| `/admin/companies/:id/dashboard` | CompanyDashboardComponent | ✅ |

## 💡 Ventajas del Enfoque Standalone

### 🚀 Performance
- **Lazy loading granular**: Cada componente se carga solo cuando se necesita
- **Tree shaking mejorado**: Solo se incluye código usado
- **Bundles más pequeños**: Sin overhead de NgModule

### 🛠️ Desarrollo
- **Menos boilerplate**: No hay `declarations`, `exports`, `imports` de módulos
- **Imports explícitos**: Cada componente declara sus dependencias
- **Más fácil de refactorizar**: Componentes autocontenidos

### 📦 Reutilización
- **Componentes portables**: Se pueden usar en cualquier parte sin importar módulos
- **Testing simplificado**: Componentes standalone son más fáciles de testear
- **Compartir componentes**: Más fácil exportar y reutilizar

## 📊 Componentes Implementados

### 1. **Metrics Overview** (`/admin/metrics`)
```typescript
@Component({
  selector: 'app-metrics-overview',
  standalone: true,
  imports: [CommonModule],
  // ...
})
```
- Vista global del SaaS
- Métricas de empresas activas, suspendidas, en trial
- Distribución por plan

### 2. **Plans List** (`/admin/plans`)
```typescript
@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [CommonModule],
  // ...
})
```
- Listado de planes de suscripción
- Cards con precios y límites
- Acciones para ver/editar

### 3. **Companies List** (`/admin/companies`)
```typescript
@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // ...
})
```
- Tabla de empresas con filtros
- Paginación
- Indicadores de uso

### 4. **Company Dashboard** (`/admin/companies/:id/dashboard`)
```typescript
@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule],
  // ...
})
```
- Dashboard detallado de empresa
- Alertas automáticas
- Acciones administrativas

## 🔐 Autenticación

### Headers Automáticos
El `AdminService` extiende `BaseApiService` que usa `HeadersService`:

```typescript
// Automáticamente agrega:
Authorization: Bearer {jwt-token}
```

**IMPORTANTE:**
- ❌ **NO** requiere `X-Tenant-ID` (super-admin es global)
- ✅ JWT debe tener `role: 'super-admin'`

## 📝 Servicios Compartidos

### AdminService
```typescript
// services/admin/admin.service.ts
@Injectable({ providedIn: 'root' })
export class AdminService extends BaseApiService {
  // Se inyecta automáticamente, no necesita estar en providers
}
```

**Métodos disponibles:**
- `getPlans()` - Listar planes
- `createPlan(dto)` - Crear plan
- `getCompanies(filters)` - Listar empresas
- `getCompanyDashboard(id)` - Dashboard de empresa
- `updateCompanyStatus(id, dto)` - Cambiar estado
- `extendSubscription(id, dto)` - Extender suscripción
- `getMetricsOverview()` - Métricas globales

## 🧪 Testing

### Componente Standalone
```typescript
// plans-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlansListComponent } from './plans-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlansListComponent', () => {
  let component: PlansListComponent;
  let fixture: ComponentFixture<PlansListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlansListComponent, // Importa el componente standalone
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlansListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 🔄 Migración de NgModule a Standalone

### Antes (NgModule)
```typescript
@NgModule({
  declarations: [PlansListComponent],
  imports: [CommonModule, RouterModule],
  exports: [PlansListComponent]
})
export class AdminModule { }
```

### Después (Standalone)
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PlansListComponent { }
```

## 📚 Recursos

- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Angular Router Guards](https://angular.io/guide/router#preventing-unauthorized-access)
- [Lazy Loading](https://angular.io/guide/lazy-loading-ngmodules)

## 🎯 Próximos Pasos

1. ✅ Componentes standalone implementados
2. ✅ Lazy loading configurado
3. ⏳ Crear formularios para crear/editar planes
4. ⏳ Crear formulario para crear empresas
5. ⏳ Agregar gráficos con Chart.js
6. ⏳ Implementar búsqueda de empresas

---

**Última actualización:** 2025-11-22
**Versión:** 2.0.0 (Standalone)
**Angular:** 18+
