# Módulo Admin - Frontend Angular

## 📋 Descripción

Módulo completo para la gestión administrativa del sistema SaaS. Permite a usuarios con rol **Super Admin** gestionar planes de suscripción, empresas (tenants), suscripciones y visualizar métricas globales del sistema.

## 🗂️ Estructura del Módulo

```
src/app/
├── interfaces/admin/           # Interfaces TypeScript
│   ├── plan.interface.ts       # Plan, CreatePlanDto, UpdatePlanDto
│   ├── subscription.interface.ts  # Subscription, SubscriptionStatus
│   ├── usage-metric.interface.ts  # UsageMetric, UsageSummary
│   ├── company.interface.ts    # Company, CompanyListItem, DTOs
│   ├── dashboard.interface.ts  # CompanyDashboard, MetricsOverview
│   ├── query.interface.ts      # FilterCompaniesDto, PaginatedResponse
│   └── index.ts                # Exportaciones
│
├── services/admin/
│   └── admin.service.ts        # AdminService (extiende BaseApiService)
│
└── pages/admin/
    ├── plans/
    │   ├── plans-list.component.ts
    │   ├── plans-list.component.html
    │   └── plans-list.component.css
    │
    ├── companies/
    │   ├── companies-list.component.ts
    │   ├── companies-list.component.html
    │   ├── companies-list.component.css
    │   ├── company-dashboard.component.ts
    │   ├── company-dashboard.component.html
    │   └── company-dashboard.component.css
    │
    ├── metrics/
    │   ├── metrics-overview.component.ts
    │   ├── metrics-overview.component.html
    │   └── metrics-overview.component.css
    │
    ├── admin.module.ts
    ├── admin-routing.module.ts
    └── README.md
```

## 🚀 Características Implementadas

### ✅ Interfaces Completas
- Tipado fuerte para todos los modelos del backend
- DTOs para creación y actualización
- Interfaces para respuestas paginadas
- Enums para estados (SubscriptionStatus, CompanyStatus)

### ✅ Servicio AdminService
- Extiende `BaseApiService` para reutilizar funcionalidad
- **NO** requiere `X-Tenant-ID` (es para super-admin global)
- Métodos para gestión de:
  - Planes: CRUD completo
  - Empresas: crear, listar, dashboard, cambiar estado
  - Suscripciones: asignar plan, extender
  - Métricas: overview global del sistema

### ✅ Componentes UI

#### 1. Plans List (`/admin/plans`)
- Listado de planes en formato cards
- Muestra precios, límites y funcionalidades
- Badges para estado activo/inactivo y custom
- Botones para ver y editar planes

#### 2. Companies List (`/admin/companies`)
- Tabla con todas las empresas del sistema
- Filtros por estado y plan
- Paginación (20 items por página)
- Muestra suscripción, uso de facturas y usuarios
- Barras de progreso visuales para uso
- Link a dashboard individual

#### 3. Company Dashboard (`/admin/companies/:id/dashboard`)
- Vista detallada de una empresa específica
- Información de suscripción y plan
- Alertas automáticas (expiración, límites)
- Listado de usuarios de la empresa
- Métricas de uso actual
- Acciones administrativas:
  - Suspender/Activar empresa
  - Extender suscripción

#### 4. Metrics Overview (`/admin/metrics`)
- Métricas globales del SaaS
- Total de empresas, activas, suspendidas, en trial
- Distribución de empresas por plan
- Cards visuales con colores distintivos

## 📦 Cómo Usar

### 1. Importar el Módulo en App

Agregar en `app-routing.module.ts` o donde corresponda:

```typescript
{
  path: 'admin',
  loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
  canActivate: [SuperAdminGuard] // Guard para proteger rutas
}
```

### 2. Crear Guard para Super Admin

```typescript
// super-admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if (user && user.role === 'super-admin') {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

### 3. Usar el Servicio

```typescript
import { AdminService } from '@services/admin/admin.service';

constructor(private adminService: AdminService) {}

// Listar planes
this.adminService.getPlans().subscribe(plans => {
  console.log(plans);
});

// Crear empresa
const dto: CreateCompanyWithPlanDto = {
  businessName: 'Mi Empresa',
  rut: '76.123.456-7',
  email: 'contacto@empresa.cl',
  planId: 'plan-uuid',
  initialAdmin: {
    email: 'admin@empresa.cl',
    firstName: 'Juan',
    lastName: 'Pérez',
    password: 'SecurePass123!'
  }
};

this.adminService.createCompany(dto).subscribe(result => {
  console.log('Empresa creada:', result.company);
  console.log('Suscripción:', result.subscription);
  console.log('Admin:', result.adminUser);
});
```

## 🔐 Autenticación

### Headers Requeridos

```typescript
Authorization: Bearer {jwt-token}
```

**IMPORTANTE:**
- ❌ **NO** enviar header `X-Tenant-ID`
- ✅ El token JWT debe contener `role: 'super-admin'`
- El `HeadersService` automáticamente agrega el token

### Flujo de Autenticación

1. Login como super-admin
2. Backend retorna JWT con `role: 'super-admin'` y `companyId: null`
3. Frontend guarda token en localStorage/sessionStorage
4. Interceptor agrega `Authorization` header automáticamente
5. Todas las peticiones a `/admin/*` tienen acceso global

## 📊 Rutas Disponibles

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | Redirect a `/admin/metrics` | Ruta raíz |
| `/admin/metrics` | MetricsOverviewComponent | Métricas globales |
| `/admin/plans` | PlansListComponent | Listado de planes |
| `/admin/companies` | CompaniesListComponent | Listado de empresas |
| `/admin/companies/:id/dashboard` | CompanyDashboardComponent | Dashboard de empresa |

## 🎨 Estilos y UI

### Clases CSS Personalizadas

Cada componente tiene su propio archivo CSS con:
- Estilos para cards y badges
- Animaciones hover
- Colores distintivos por estado
- Responsive design

### Bootstrap y FontAwesome

El módulo asume que el proyecto tiene:
- Bootstrap 4/5 para grid y componentes
- FontAwesome para iconos

## 🔄 Integración con Backend

### Base URL

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

Todas las peticiones usan: `${apiUrl}/admin/*`

### Manejo de Errores

El servicio utiliza el manejo de errores del `BaseApiService`. Los errores HTTP se propagan al componente que puede manejarlos:

```typescript
this.adminService.createPlan(dto).subscribe({
  next: (plan) => {
    // Éxito
  },
  error: (error) => {
    // Manejar error (400, 401, 403, 404, 500)
    console.error('Error:', error);
  }
});
```

## 📝 Próximas Mejoras

- [ ] Formulario para crear/editar planes
- [ ] Formulario para crear empresas
- [ ] Componente para cambiar plan de empresa
- [ ] Gráficos para métricas (Chart.js o similar)
- [ ] Exportar reportes en CSV/PDF
- [ ] Búsqueda de empresas por nombre/RUT
- [ ] Logs de auditoría de acciones administrativas
- [ ] Notificaciones en tiempo real

## 🤝 Contribuir

Al agregar nuevas funcionalidades:
1. Mantener consistencia con estructura existente
2. Actualizar interfaces si cambian los DTOs del backend
3. Seguir el patrón de componente + template + estilos
4. Documentar en este README

## 📚 Recursos

- [Documentación Backend](../../../docs/guia-uso-modulo-admin.md)
- [Swagger API](http://localhost:3000/api)
- [Interfaces TypeScript](../../interfaces/admin/)

---

**Última actualización:** 2025-11-22
**Versión:** 1.0.0
