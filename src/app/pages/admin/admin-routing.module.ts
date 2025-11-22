// admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlansListComponent } from './plans/plans-list.component';
import { CompaniesListComponent } from './companies/companies-list.component';
import { CompanyDashboardComponent } from './companies/company-dashboard.component';
import { MetricsOverviewComponent } from './metrics/metrics-overview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'metrics',
    pathMatch: 'full'
  },
  {
    path: 'metrics',
    component: MetricsOverviewComponent
  },
  {
    path: 'plans',
    component: PlansListComponent
  },
  {
    path: 'companies',
    component: CompaniesListComponent
  },
  {
    path: 'companies/:id/dashboard',
    component: CompanyDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
