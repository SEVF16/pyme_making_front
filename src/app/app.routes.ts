import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CompaniesComponent } from './features/companies/companies.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: '',
    component: CompaniesComponent,
    children: [
      {
        path: 'companies',
        loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent),
        title: 'Gestión de Empresas'
      },
      // Otras rutas que requieren layout
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ]
  },
  // Redirección por defecto
  { path: '**', redirectTo: '/login' }
];