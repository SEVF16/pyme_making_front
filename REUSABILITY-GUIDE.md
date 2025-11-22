# 📋 Guía de Reutilización - Proyecto Angular

## Tabla de Contenidos
- [1. Componentes Shared](#1-componentes-shared)
- [2. auth.service.ts](#2-authservicets)
- [3. base-api.service.ts](#3-base-apiservicets)
- [4. headers.service.ts](#4-headersservicets)
- [5. Patrón de Reutilización Recomendado](#5-patrón-de-reutilización-recomendado)

---

## 1. Componentes Shared

Tu proyecto utiliza **Angular Standalone Components** (sin módulos tradicionales). Los componentes reutilizables están ubicados en `/src/app/shared/components/`.

### 1.1 `<app-input>` - Input Reutilizable

**Ubicación:** `src/app/shared/components/input/input.component.ts:11`

Input personalizado con soporte para máscaras, iconos, validaciones y diferentes tamaños.

#### Características:
- ✅ Integración con `FormControl` de Angular Forms
- ✅ Soporte para máscaras con `ngx-mask`
- ✅ Iconos personalizados con Lucide Icons
- ✅ Validaciones visuales automáticas
- ✅ Iconos clickeables (tipo botón)
- ✅ Diferentes tamaños (small, medium, large)

#### Cómo reutilizarlo:

```typescript
import { InputComponent } from '@shared/components/input/input.component';
import { FormControl, Validators } from '@angular/forms';
import { Mail } from 'lucide-angular';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule]
})
export class MiComponente {
  readonly MailIcon = Mail;

  emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  phoneControl = new FormControl('', Validators.required);
}
```

```html
<!-- Input básico -->
<app-input
  label="Email"
  [control]="emailControl"
  placeholder="ejemplo@email.com"
/>

<!-- Input con icono -->
<app-input
  label="Email"
  [control]="emailControl"
  placeholder="ejemplo@email.com"
  [iconName]="MailIcon"
  iconPosition="left"
/>

<!-- Input con máscara (teléfono) -->
<app-input
  label="Teléfono"
  [control]="phoneControl"
  placeholder="+56 9 1234 5678"
  mask="+00 0 0000 0000"
/>

<!-- Input con máscara avanzada -->
<app-input
  label="RUT"
  [control]="rutControl"
  [mask]="{
    mask: '00.000.000-0',
    dropSpecialCharacters: false
  }"
/>
```

#### Propiedades Disponibles:

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `label` | `string` | `''` | Etiqueta del input |
| `placeholder` | `string` | `''` | Texto de placeholder |
| `type` | `string` | `'text'` | Tipo de input (text, email, password, etc.) |
| `control` | `FormControl` | **requerido** | FormControl de Angular Forms |
| `iconName` | `LucideIconData` | `null` | Icono de Lucide |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del icono |
| `iconType` | `'icon' \| 'button'` | `'icon'` | Tipo de icono (decorativo o clickeable) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño del input |
| `mask` | `string \| MaskConfig` | `''` | Máscara para el input |
| `readonly` | `boolean` | `false` | Input de solo lectura |

#### Eventos:

| Evento | Descripción |
|--------|-------------|
| `iconClick` | Se emite cuando se hace click en el icono (solo si `iconType="button"`) |

---

### 1.2 `<app-select-lib>` - Select Reutilizable

**Ubicación:** `src/app/shared/components/select-lib/select-lib.component.ts:11`

Dropdown personalizado basado en PrimeNG con validaciones integradas.

#### Características:
- ✅ Basado en PrimeNG Dropdown
- ✅ Soporte para filtrado
- ✅ Botón de limpieza
- ✅ Validaciones visuales automáticas
- ✅ Integración con FormControl

#### Cómo reutilizarlo:

```typescript
import { SelectLibComponent, Option } from '@shared/components/select-lib/select-lib.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [SelectLibComponent, ReactiveFormsModule]
})
export class MiComponente {
  statusControl = new FormControl('', Validators.required);

  statusOptions: Option[] = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
    { label: 'Suspendido', value: 'suspended' }
  ];

  paisesOptions: Option[] = [
    { label: 'Chile', value: 'CL' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Perú', value: 'PE' }
  ];
}
```

```html
<!-- Select básico -->
<app-select-lib
  label="Estado"
  [options]="statusOptions"
  [control]="statusControl"
  placeholder="Seleccione un estado"
/>

<!-- Select con filtro -->
<app-select-lib
  label="País"
  [options]="paisesOptions"
  [control]="paisControl"
  [filter]="true"
  placeholder="Buscar país..."
/>

<!-- Select con botón de limpieza -->
<app-select-lib
  label="Categoría"
  [options]="categorias"
  [control]="categoriaControl"
  [showClear]="true"
/>
```

#### Propiedades Disponibles:

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `label` | `string` | `''` | Etiqueta del select |
| `placeholder` | `string` | `'Selecciona una opción'` | Texto de placeholder |
| `options` | `Option[]` | `[]` | Array de opciones |
| `control` | `AbstractControl` | `null` | FormControl de Angular Forms |
| `filter` | `boolean` | `false` | Habilita filtrado de opciones |
| `showClear` | `boolean` | `false` | Muestra botón para limpiar selección |
| `disabled` | `boolean` | `false` | Deshabilita el select |

#### Interface Option:

```typescript
export interface Option {
  label: string;  // Texto a mostrar
  value: any;     // Valor del option
}
```

---

### 1.3 `<app-button-lib>` - Botón Reutilizable

**Ubicación:** `src/app/shared/components/buttonlib/button-lib.component.ts:6`

Botón personalizado con múltiples variantes, tamaños e iconos.

#### Características:
- ✅ Múltiples variantes (primary, secondary, outline, etc.)
- ✅ Diferentes tamaños (sm, md, lg)
- ✅ Soporte para iconos (Lucide Icons)
- ✅ Estados de carga (loading)
- ✅ Ancho completo opcional
- ✅ Basado en PrimeNG Button

#### Cómo reutilizarlo:

```typescript
import { ButtonLibComponent } from '@shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '@shared/components/buttonlib/interfaces/button.interface';
import { Plus, Save, Trash } from 'lucide-angular';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [ButtonLibComponent]
})
export class MiComponente {
  readonly PlusIcon = Plus;
  readonly SaveIcon = Save;
  readonly TrashIcon = Trash;

  isLoading = false;

  createButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Crear Nuevo',
    iconPosition: 'left'
  };

  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Guardar',
    loading: this.isLoading,
    disabled: this.isLoading
  };

  handleCreate() {
    console.log('Crear nuevo registro');
  }

  handleSave() {
    this.isLoading = true;
    // Simular guardado
    setTimeout(() => this.isLoading = false, 2000);
  }
}
```

```html
<!-- Botón con icono -->
<app-button-lib
  [configuration]="createButtonConfig"
  (buttonClick)="handleCreate()"
/>

<!-- Botón con estado de carga -->
<app-button-lib
  [configuration]="saveButtonConfig"
  (buttonClick)="handleSave()"
/>

<!-- Botón solo icono -->
<app-button-lib
  [configuration]="{
    variant: 'outline',
    icon: TrashIcon,
    iconPosition: 'only',
    size: 'sm'
  }"
  (buttonClick)="eliminar()"
/>

<!-- Botón ancho completo -->
<app-button-lib
  [configuration]="{
    variant: 'primary',
    text: 'Continuar',
    fullWidth: true
  }"
  (buttonClick)="continuar()"
/>
```

#### Interface ButtonConfig:

```typescript
export interface ButtonConfig {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIconData;           // Icono de Lucide
  text?: string;                   // Texto del botón
  iconPosition?: 'left' | 'right' | 'only';
  iconSize?: number;               // Tamaño del icono (default: 16)
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;               // Muestra spinner de carga
  fullWidth?: boolean;             // Ancho completo
  cssClass?: string;               // Clases CSS adicionales
}
```

#### Eventos:

| Evento | Descripción |
|--------|-------------|
| `buttonClick` | Se emite cuando se hace click en el botón |

---

### 1.4 `<app-custom-data-table>` - Tabla de Datos Reutilizable

**Ubicación:** `src/app/shared/components/data-table/custom-data-table.component.ts:29`

Tabla completa con paginación, acciones por fila, ordenamiento y templates personalizados.

#### Características:
- ✅ Basada en PrimeNG Table
- ✅ Paginación automática
- ✅ Acciones por fila (ver, editar, eliminar)
- ✅ Columnas configurables
- ✅ Templates personalizados
- ✅ Lazy loading
- ✅ Responsive

#### Cómo reutilizarlo:

```typescript
import { CustomDataTableComponent } from '@shared/components/data-table/custom-data-table.component';
import { TableColumn, TableConfig } from '@shared/components/data-table/models/data-table.models';
import { Edit, Eye, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CustomDataTableComponent]
})
export class MiComponente {
  data: Usuario[] = [];

  tableColumns: TableColumn[] = [
    {
      field: 'name',
      header: 'Nombre',
      width: '200px'
    },
    {
      field: 'email',
      header: 'Email',
      width: '250px'
    },
    {
      field: 'role',
      header: 'Rol',
      align: 'center'
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '150px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          tooltip: 'Ver detalles',
          command: (rowData, rowIndex) => this.verDetalle(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar usuario',
          command: (rowData, rowIndex) => this.editar(rowData),
          visible: (rowData) => rowData.status !== 'suspended'
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar usuario',
          command: (rowData, rowIndex) => this.eliminar(rowData),
          disabled: (rowData) => rowData.isSystem
        }
      ]
    }
  ];

  tableConfig: TableConfig = {
    showPaginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    responsive: true,
    dataKey: 'id',
    emptyMessage: 'No hay usuarios registrados',
    tableStyleClass: 'table-hover'
  };

  verDetalle(usuario: Usuario) {
    console.log('Ver detalle:', usuario);
  }

  editar(usuario: Usuario) {
    console.log('Editar:', usuario);
  }

  eliminar(usuario: Usuario) {
    console.log('Eliminar:', usuario);
  }
}
```

```html
<app-custom-data-table
  [data]="data"
  [columns]="tableColumns"
  [config]="tableConfig"
  (pageChange)="onPageChange($event)"
/>
```

#### Interface TableColumn:

```typescript
export interface TableColumn {
  field: string;                    // Campo del objeto a mostrar
  header: string;                   // Título de la columna
  width?: string;                   // Ancho de la columna
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;                 // Ocultar columna
  template?: string;                // Template personalizado
  subtitle?: string;                // Campo para subtítulo
  customRender?: (rowData: any) => string;  // Función de renderizado custom
  actions?: TableAction[];          // Array de acciones (para columnas de acciones)
}
```

#### Interface TableAction:

```typescript
export interface TableAction {
  label: string;                    // Label del botón
  icon: string;                     // Nombre del icono ('eye', 'edit', 'delete')
  severity?: string;                // Severidad del botón PrimeNG
  tooltip?: string;                 // Tooltip del botón
  command: (rowData: any, rowIndex: number) => void;  // Función a ejecutar
  visible?: (rowData: any) => boolean;    // Mostrar/ocultar acción condicionalmente
  disabled?: (rowData: any) => boolean;   // Deshabilitar acción condicionalmente
}
```

#### Interface TableConfig:

```typescript
export interface TableConfig {
  showPaginator?: boolean;          // Mostrar paginador
  rows?: number;                    // Filas por página
  rowsPerPageOptions?: number[];    // Opciones de filas por página
  responsive?: boolean;             // Tabla responsive
  dataKey?: string;                 // Campo único (generalmente 'id')
  emptyMessage?: string;            // Mensaje cuando no hay datos
  tableStyleClass?: string;         // Clases CSS adicionales
}
```

---

### 1.5 `<app-header>` - Header Reutilizable

**Ubicación:** `src/app/shared/components/header/header.component.ts:11`

Componente de header con menú de usuario y toggle de sidebar.

#### Cómo reutilizarlo:

```typescript
import { HeaderComponent } from '@shared/components/header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent]
})
export class LayoutComponent {
  onToggleSidebar() {
    console.log('Toggle sidebar');
  }
}
```

```html
<app-header (toggleSidebar)="onToggleSidebar()" />
```

---

## 2. auth.service.ts

**Ubicación:** `src/app/services/auth.service.ts:125`

Servicio completo de autenticación con estado reactivo, persistencia y gestión de tokens.

### Características:
- ✅ **Estado reactivo** con `BehaviorSubject`
- ✅ **Persistencia automática** en localStorage
- ✅ **Token management automático** vía `HeadersService`
- ✅ **SSR compatible** (verifica `isPlatformBrowser`)
- ✅ Métodos: login, logout, refreshToken, changePassword, getProfile
- ✅ Manejo de errores integrado

### Cómo reutilizarlo:

```typescript
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.authService.authState$.subscribe(state => {
      console.log('Usuario:', state.user);
      console.log('Autenticado:', state.isAuthenticated);
      console.log('Cargando:', state.loading);
      console.log('Error:', state.error);
    });
  }

  // Login
  login() {
    this.authService.login({
      email: 'usuario@example.com',
      password: 'password123',
      companyId: 'company-uuid'
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // Navegar al dashboard
      },
      error: (error) => {
        console.error('Error en login:', error);
      }
    });
  }

  // Logout
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout exitoso');
        // Navegar al login
      }
    });
  }

  // Obtener perfil del usuario
  obtenerPerfil() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        console.log('Perfil del usuario:', user);
      }
    });
  }

  // Cambiar contraseña
  cambiarPassword() {
    this.authService.changePassword('oldPassword', 'newPassword')
      .subscribe({
        next: (response) => {
          console.log('Contraseña cambiada');
        }
      });
  }

  // Refresh token
  refreshToken() {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        console.log('Token renovado');
      }
    });
  }
}
```

### Acceso directo al estado (sin suscripción):

```typescript
// Verificar si el usuario está autenticado
if (this.authService.isAuthenticated) {
  console.log('Usuario autenticado');
}

// Obtener usuario actual
const usuario = this.authService.currentUser;
console.log('Usuario:', usuario?.email);

// Obtener token actual
const token = this.authService.authToken;

// Verificar si está cargando
if (this.authService.isLoading) {
  console.log('Procesando...');
}

// Obtener nombre para mostrar
const nombreUsuario = this.authService.getUserDisplayName(usuario);
```

### Guards de Autenticación:

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

### Interfaces Principales:

```typescript
// Request de login
export interface LoginRequest {
  email: string;
  password: string;
  companyId: string;
}

// Usuario
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  companyId?: string;
  tenant_id?: string;
  company?: Company;
  permissions?: string[];
  is_active?: boolean;
}

// Estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

---

## 3. base-api.service.ts

**Ubicación:** `src/app/services/base-api.service.ts:11`

Clase base abstracta para todos los servicios que interactúan con la API.

### Características:
- ✅ **Métodos HTTP genéricos** (GET, POST, PUT, DELETE, PATCH)
- ✅ **Headers automáticos** (incluye `Authorization` y `x-tenant-id`)
- ✅ **Base URL configurada** desde environment
- ✅ **Integración con HeadersService**

### Cómo reutilizarlo:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '@services/base-api.service';
import { HeadersService } from '@services/headers.service';

interface MiEntidad {
  id: string;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MiServicio extends BaseApiService {

  constructor(
    override http: HttpClient,
    override headersService: HeadersService
  ) {
    super(http, headersService);
  }

  // GET - Obtener todos
  obtenerTodos(params?: any): Observable<MiEntidad[]> {
    return this.get<MiEntidad[]>('mi-endpoint', params);
  }

  // GET - Obtener uno por ID
  obtenerPorId(id: string): Observable<MiEntidad> {
    return this.get<MiEntidad>(`mi-endpoint/${id}`);
  }

  // POST - Crear
  crear(data: Partial<MiEntidad>): Observable<MiEntidad> {
    return this.post<MiEntidad>('mi-endpoint', data);
  }

  // PUT - Actualizar completo
  actualizar(id: string, data: MiEntidad): Observable<MiEntidad> {
    return this.put<MiEntidad>(`mi-endpoint/${id}`, data);
  }

  // PATCH - Actualizar parcial
  actualizarParcial(id: string, data: Partial<MiEntidad>): Observable<MiEntidad> {
    return this.patch<MiEntidad>(`mi-endpoint/${id}`, data);
  }

  // DELETE - Eliminar
  eliminar(id: string): Observable<void> {
    return this.delete<void>(`mi-endpoint/${id}`);
  }

  // GET con parámetros de búsqueda
  buscar(termino: string, filtros?: any): Observable<MiEntidad[]> {
    const params = {
      search: termino,
      ...filtros
    };
    return this.get<MiEntidad[]>('mi-endpoint/buscar', params);
  }
}
```

### Métodos Heredados:

| Método | Firma | Descripción |
|--------|-------|-------------|
| `get<T>()` | `get<T>(endpoint: string, params?: any): Observable<T>` | Realiza petición GET |
| `post<T>()` | `post<T>(endpoint: string, data: any): Observable<T>` | Realiza petición POST |
| `put<T>()` | `put<T>(endpoint: string, data: any): Observable<T>` | Realiza petición PUT |
| `patch<T>()` | `patch<T>(endpoint: string, data: any): Observable<T>` | Realiza petición PATCH |
| `delete<T>()` | `delete<T>(endpoint: string): Observable<T>` | Realiza petición DELETE |

### Ejemplo con Respuesta Paginada:

```typescript
import { ApiPaginatedResponse } from '@interfaces/api-response.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductosService extends BaseApiService {

  obtenerProductos(page: number, limit: number): Observable<ApiPaginatedResponse<Producto>> {
    const params = {
      offset: (page - 1) * limit,
      limit: limit,
      sortField: 'createdAt',
      sortDirection: 'DESC'
    };

    return this.get<ApiPaginatedResponse<Producto>>('products', params);
  }
}
```

### Ventajas de extender BaseApiService:

1. **No necesitas manejar headers manualmente** - Se agregan automáticamente
2. **No necesitas concatenar la base URL** - Ya está configurada
3. **Token de autorización automático** - Se incluye en cada petición
4. **Tenant-ID automático** - Se incluye si está configurado
5. **Tipado fuerte** - Todos los métodos son genéricos con TypeScript

---

## 4. headers.service.ts

**Ubicación:** `src/app/services/headers.service.ts:6`

Servicio singleton para gestionar headers HTTP globales de forma centralizada.

### Características:
- ✅ **Headers por defecto** (Content-Type, Accept, X-Requested-With)
- ✅ **Gestión de token de autorización**
- ✅ **Headers personalizados**
- ✅ **Singleton** (providedIn: 'root')

### Cómo reutilizarlo:

#### Uso Normal (automático vía BaseApiService):

En la mayoría de los casos, **NO necesitas usar HeadersService directamente**. `BaseApiService` y `AuthService` lo manejan automáticamente.

#### Uso Directo (casos especiales):

```typescript
import { HeadersService } from '@services/headers.service';

@Injectable({
  providedIn: 'root'
})
export class MiServicio {

  constructor(private headersService: HeadersService) {}

  // Establecer un header personalizado
  setearHeaderCustom() {
    this.headersService.setHeader('X-Custom-Header', 'mi-valor');
  }

  // Establecer múltiples headers
  setearVariosHeaders() {
    this.headersService.setHeaders({
      'X-API-Key': 'mi-api-key',
      'X-Client-Version': '1.0.0'
    });
  }

  // Obtener todos los headers actuales
  obtenerHeaders() {
    const headers = this.headersService.getHeaders();
    console.log('Headers actuales:', headers);
  }

  // Remover un header específico
  removerHeader() {
    this.headersService.removeHeader('X-Custom-Header');
  }

  // Limpiar todos los headers (volver a defaults)
  limpiarHeaders() {
    this.headersService.clearHeaders();
  }

  // Establecer token manualmente (aunque AuthService ya lo hace)
  setearToken(token: string) {
    this.headersService.setAuthToken(token);
  }

  // Remover token
  removerToken() {
    this.headersService.removeAuthToken();
  }
}
```

### Headers por Defecto:

El servicio configura automáticamente estos headers en todas las peticiones:

```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
}
```

### Flujo de Headers:

```
1. AuthService hace login
   ↓
2. AuthService llama a headersService.setAuthToken(token)
   ↓
3. HeadersService almacena: { 'Authorization': 'Bearer token123' }
   ↓
4. BaseApiService llama a headersService.getHeaders()
   ↓
5. Todas las peticiones incluyen automáticamente el token
```

### ⚠️ Importante:

- **AuthService gestiona automáticamente** el token de autorización (línea 359)
- **BaseApiService obtiene automáticamente** todos los headers (línea 59-60)
- **Solo usa HeadersService directamente** si necesitas headers custom adicionales

---

## 5. Patrón de Reutilización Recomendado

### 5.1 Arquitectura de Servicios

```typescript
// ✅ PATRÓN CORRECTO

// 1. Crear servicio extendiendo BaseApiService
@Injectable({ providedIn: 'root' })
export class MiServicio extends BaseApiService {

  constructor(
    override http: HttpClient,
    override headersService: HeadersService
  ) {
    super(http, headersService);
  }

  // 2. Usar métodos heredados (get, post, put, delete, patch)
  obtenerDatos(): Observable<Dato[]> {
    return this.get<Dato[]>('endpoint');
  }
}

// ❌ EVITAR - No crear peticiones HTTP manualmente
@Injectable({ providedIn: 'root' })
export class MiServicioIncorrecto {

  constructor(private http: HttpClient) {}

  // Esto NO reutiliza la infraestructura existente
  obtenerDatos(): Observable<Dato[]> {
    return this.http.get<Dato[]>('https://api.com/endpoint', {
      headers: { 'Authorization': 'Bearer token' } // ❌ Headers manuales
    });
  }
}
```

### 5.2 Arquitectura de Componentes

```typescript
// ✅ PATRÓN CORRECTO - Standalone Components

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Importar componentes shared directamente
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    CustomDataTableComponent
  ]
})
export class MiComponente {
  // Usar FormControls para componentes shared
  nombreControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
}
```

### 5.3 Gestión de Autenticación

```typescript
// ✅ PATRÓN CORRECTO

@Component({...})
export class MiComponente implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al estado reactivo
    this.authService.authState$.subscribe(state => {
      // Reaccionar a cambios de autenticación
    });
  }

  // Usar métodos del servicio
  login() {
    this.authService.login(credentials).subscribe();
  }
}

// ❌ EVITAR - No gestionar tokens manualmente
@Component({...})
export class ComponenteIncorrecto {

  login() {
    // ❌ No hacer esto
    localStorage.setItem('token', 'token123');
    this.headersService.setAuthToken('token123');
  }
}
```

### 5.4 Estructura de Proyecto Recomendada

```
src/app/
├── shared/                          # Componentes reutilizables
│   ├── components/
│   │   ├── input/
│   │   ├── select-lib/
│   │   ├── button-lib/
│   │   ├── data-table/
│   │   └── header/
│   ├── interfaces/
│   └── pipes/
│
├── services/                        # Servicios compartidos
│   ├── auth.service.ts             # ✅ Usar para autenticación
│   ├── base-api.service.ts         # ✅ Extender para servicios API
│   ├── headers.service.ts          # ✅ Gestionado automáticamente
│   └── [entidad]/
│       └── [entidad].service.ts    # Extiende BaseApiService
│
├── features/                        # Módulos de funcionalidad
│   ├── products/
│   ├── customers/
│   └── users/
│
└── interfaces/                      # Interfaces globales
    ├── api-response.interfaces.ts
    └── [entidad].interfaces.ts
```

### 5.5 Checklist de Reutilización

#### Para crear un nuevo servicio API:

- [ ] Extender `BaseApiService`
- [ ] Inyectar `HttpClient` y `HeadersService` con `override`
- [ ] Llamar a `super(http, headersService)` en el constructor
- [ ] Usar métodos heredados (get, post, put, delete, patch)
- [ ] NO manejar headers manualmente
- [ ] NO concatenar base URL manualmente

#### Para usar componentes shared:

- [ ] Importar componente en el array `imports` del standalone component
- [ ] Crear `FormControl` para componentes de formulario
- [ ] Configurar interfaces (`ButtonConfig`, `TableColumn`, etc.)
- [ ] Suscribirse a eventos de salida (`Output`)

#### Para autenticación:

- [ ] Inyectar `AuthService`
- [ ] Suscribirse a `authState$` para estado reactivo
- [ ] Usar métodos del servicio (login, logout, getProfile)
- [ ] NO gestionar tokens manualmente
- [ ] NO acceder a localStorage directamente para auth

---

## 6. Ejemplos Completos

### 6.1 Formulario Completo con Componentes Shared

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectLibComponent, Option } from '@shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '@shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '@shared/components/buttonlib/interfaces/button.interface';
import { Mail, User, Lock, Save } from 'lucide-angular';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent
  ],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="guardar()">
      <div class="form-grid">
        <!-- Input de texto -->
        <app-input
          label="Nombre completo"
          [control]="formulario.controls.nombre"
          placeholder="Ingrese su nombre"
          [iconName]="UserIcon"
          iconPosition="left"
        />

        <!-- Input de email -->
        <app-input
          label="Email"
          type="email"
          [control]="formulario.controls.email"
          placeholder="ejemplo@email.com"
          [iconName]="MailIcon"
          iconPosition="left"
        />

        <!-- Input con máscara -->
        <app-input
          label="Teléfono"
          [control]="formulario.controls.telefono"
          placeholder="+56 9 1234 5678"
          mask="+00 0 0000 0000"
        />

        <!-- Select -->
        <app-select-lib
          label="Rol"
          [options]="rolesOptions"
          [control]="formulario.controls.rol"
          [filter]="true"
          placeholder="Seleccione un rol"
        />

        <!-- Input de password -->
        <app-input
          label="Contraseña"
          type="password"
          [control]="formulario.controls.password"
          placeholder="••••••••"
          [iconName]="LockIcon"
          iconPosition="left"
        />

        <!-- Botón de submit -->
        <app-button-lib
          [configuration]="saveButtonConfig"
          (buttonClick)="guardar()"
        />
      </div>
    </form>
  `
})
export class RegistroComponent {
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly SaveIcon = Save;

  rolesOptions: Option[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Usuario', value: 'user' },
    { label: 'Invitado', value: 'guest' }
  ];

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', Validators.required),
    rol: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Guardar Usuario',
    fullWidth: true,
    type: 'submit'
  };

  guardar() {
    if (this.formulario.valid) {
      console.log('Datos del formulario:', this.formulario.value);
    }
  }
}
```

### 6.2 Servicio Completo con BaseApiService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '@services/base-api.service';
import { HeadersService } from '@services/headers.service';
import { ApiPaginatedResponse } from '@interfaces/api-response.interfaces';

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  activo: boolean;
}

interface ClienteQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  activo?: boolean;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends BaseApiService {

  constructor(
    override http: HttpClient,
    override headersService: HeadersService
  ) {
    super(http, headersService);
  }

  // Obtener clientes con paginación
  obtenerClientes(params: ClienteQueryParams): Observable<ApiPaginatedResponse<Cliente>> {
    const queryParams = {
      limit: params.limit || 10,
      offset: params.offset || 0,
      sortField: params.sortField || 'nombre',
      sortDirection: params.sortDirection || 'ASC',
      ...params
    };

    return this.get<ApiPaginatedResponse<Cliente>>('clientes', queryParams);
  }

  // Obtener cliente por ID
  obtenerClientePorId(id: string): Observable<Cliente> {
    return this.get<Cliente>(`clientes/${id}`);
  }

  // Crear cliente
  crearCliente(cliente: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.post<Cliente>('clientes', cliente);
  }

  // Actualizar cliente
  actualizarCliente(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.patch<Cliente>(`clientes/${id}`, cliente);
  }

  // Eliminar cliente
  eliminarCliente(id: string): Observable<void> {
    return this.delete<void>(`clientes/${id}`);
  }

  // Buscar clientes
  buscarClientes(termino: string): Observable<Cliente[]> {
    return this.get<Cliente[]>('clientes/buscar', { search: termino });
  }

  // Activar/Desactivar cliente
  cambiarEstado(id: string, activo: boolean): Observable<Cliente> {
    return this.patch<Cliente>(`clientes/${id}/estado`, { activo });
  }
}
```

### 6.3 Componente con Tabla y Servicios

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CustomDataTableComponent } from '@shared/components/data-table/custom-data-table.component';
import { ButtonLibComponent } from '@shared/components/buttonlib/button-lib.component';
import { TableColumn, TableConfig } from '@shared/components/data-table/models/data-table.models';
import { ClientesService } from '@services/clientes/clientes.service';
import { Plus } from 'lucide-angular';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CustomDataTableComponent, ButtonLibComponent],
  template: `
    <div class="clientes-container">
      <div class="header">
        <h1>Gestión de Clientes</h1>
        <app-button-lib
          [configuration]="{
            variant: 'primary',
            icon: PlusIcon,
            text: 'Nuevo Cliente',
            iconPosition: 'left'
          }"
          (buttonClick)="crearCliente()"
        />
      </div>

      <app-custom-data-table
        [data]="clientes()"
        [columns]="tableColumns()"
        [config]="tableConfig()"
        (pageChange)="onPageChange($event)"
      />
    </div>
  `
})
export class ClientesComponent implements OnInit {
  readonly PlusIcon = Plus;

  clientes = signal<any[]>([]);

  tableColumns = signal<TableColumn[]>([
    { field: 'nombre', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'empresa', header: 'Empresa' },
    {
      field: 'actions',
      header: 'Acciones',
      width: '150px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          command: (data) => this.verCliente(data)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          command: (data) => this.editarCliente(data)
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          command: (data) => this.eliminarCliente(data)
        }
      ]
    }
  ]);

  tableConfig = signal<TableConfig>({
    showPaginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    dataKey: 'id'
  });

  constructor(private clientesService: ClientesService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clientesService.obtenerClientes({ limit: 10, offset: 0 })
      .subscribe({
        next: (response) => {
          this.clientes.set(response.data);
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
        }
      });
  }

  crearCliente() {
    console.log('Crear nuevo cliente');
  }

  verCliente(cliente: any) {
    console.log('Ver cliente:', cliente);
  }

  editarCliente(cliente: any) {
    console.log('Editar cliente:', cliente);
  }

  eliminarCliente(cliente: any) {
    console.log('Eliminar cliente:', cliente);
  }

  onPageChange(event: any) {
    console.log('Cambio de página:', event);
  }
}
```

---

## 7. Resumen

### ✅ Componentes Shared
- Todos son **standalone components**
- Se importan directamente en el array `imports`
- Usan **signals** y **computed** para reactividad
- Integrados con **FormControl** de Angular Forms

### ✅ BaseApiService
- **Extender siempre** para servicios API
- Métodos HTTP genéricos (get, post, put, delete, patch)
- Headers automáticos incluidos
- NO manejar tokens/headers manualmente

### ✅ AuthService
- Estado reactivo con `authState$`
- Persistencia automática
- Token management automático
- Métodos completos de autenticación

### ✅ HeadersService
- Gestionado automáticamente por BaseApiService y AuthService
- Solo usar directamente para headers custom adicionales
- Headers por defecto pre-configurados

---

**Proyecto:** PYME Making Front
**Arquitectura:** Angular Standalone Components + Services
**Versión:** 2025
