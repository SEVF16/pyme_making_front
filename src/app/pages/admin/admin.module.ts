// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

// Componentes
import { PlansListComponent } from './plans/plans-list.component';
import { CompaniesListComponent } from './companies/companies-list.component';
import { CompanyDashboardComponent } from './companies/company-dashboard.component';
import { MetricsOverviewComponent } from './metrics/metrics-overview.component';

// Servicio
import { AdminService } from '../../services/admin/admin.service';

@NgModule({
  declarations: [
    PlansListComponent,
    CompaniesListComponent,
    CompanyDashboardComponent,
    MetricsOverviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }
