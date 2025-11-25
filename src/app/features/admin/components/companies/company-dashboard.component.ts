// company-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin/admin.service';
import { CompanyDashboard } from '../../../../interfaces/admin';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css']
})
export class CompanyDashboardComponent implements OnInit {
  dashboard: CompanyDashboard | null = null;
  loading = true;
  companyId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {
    this.companyId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.adminService.getCompanyDashboard(this.companyId).subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loading = false;
      }
    });
  }

  getAlertClass(alert: string): string {
    if (alert.includes('🔴')) return 'alert-danger';
    if (alert.includes('⚠️')) return 'alert-warning';
    return 'alert-info';
  }

  suspendCompany(): void {
    const reason = prompt('Ingrese el motivo de la suspensión:');
    if (!reason) return;

    this.adminService.updateCompanyStatus(this.companyId, {
      status: 'suspended',
      reason
    }).subscribe({
      next: () => {
        alert('Empresa suspendida exitosamente');
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Error al suspender empresa:', error);
      }
    });
  }

  activateCompany(): void {
    if (!confirm('¿Está seguro de reactivar esta empresa?')) return;

    this.adminService.updateCompanyStatus(this.companyId, {
      status: 'active'
    }).subscribe({
      next: () => {
        alert('Empresa reactivada exitosamente');
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Error al reactivar empresa:', error);
      }
    });
  }

  extendSubscription(): void {
    const days = prompt('¿Cuántos días desea extender?', '30');
    if (!days) return;

    this.adminService.extendSubscription(this.companyId, {
      days: parseInt(days)
    }).subscribe({
      next: () => {
        alert('Suscripción extendida exitosamente');
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Error al extender suscripción:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/companies']);
  }
}
