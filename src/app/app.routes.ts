import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CompaniesComponent } from './features/companies/companies.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard] // Solo accesible si NO está autenticado
  },
  {
    path: '',
    canActivate: [authGuard], // Proteger todas las rutas hijas
    children: [
      {
        path: 'companies',
        loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent),
          },
          {
            path: ':id',  
            loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
          }
        ]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
      },
      // Otras rutas protegidas
      { path: '', redirectTo: '/companies', pathMatch: 'full' },
    ]
  },
  // Redirección por defecto
  { path: '**', redirectTo: '/companies' }
];