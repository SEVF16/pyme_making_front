// admin.routes.ts - Rutas standalone para el módulo Admin
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'metrics',
    pathMatch: 'full'
  },
  {
    path: 'metrics',
    loadComponent: () => import('./components/metrics/metrics-overview.component').then(m => m.MetricsOverviewComponent),
    title: 'Métricas Globales - Admin'
  },
  {
    path: 'plans',
    loadComponent: () => import('./components/plans/plans-list.component').then(m => m.PlansListComponent),
    title: 'Planes de Suscripción - Admin'
  },
  {
    path: 'companies',
    loadComponent: () => import('./components/companies/companies-list.component').then(m => m.CompaniesListComponent),
    title: 'Empresas - Admin'
  },
  {
    path: 'companies/:id/dashboard',
    loadComponent: () => import('./components/companies/company-dashboard.component').then(m => m.CompanyDashboardComponent),
    title: 'Dashboard de Empresa - Admin'
  }
];

export default ADMIN_ROUTES;
