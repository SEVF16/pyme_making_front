// companies-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';
import { CompanyListItem, Plan, CompanyStatus } from '../../../interfaces/admin';

@Component({
  selector: 'app-companies-list',
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.css']
})
export class CompaniesListComponent implements OnInit {
  companies: CompanyListItem[] = [];
  plans: Plan[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 20;

  // Filtros
  statusFilter: CompanyStatus | undefined;
  planFilter: string | undefined;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadCompanies();
  }

  loadPlans(): void {
    this.adminService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
      }
    });
  }

  loadCompanies(): void {
    this.loading = true;

    this.adminService.getCompanies({
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: this.statusFilter,
      planId: this.planFilter
    }).subscribe({
      next: (response) => {
        this.companies = response.data;
        this.totalPages = response.meta.totalPages;
        this.totalItems = response.meta.total;
        this.currentPage = response.meta.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCompanies();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCompanies();
    }
  }

  viewDashboard(id: string): void {
    this.router.navigate(['/admin/companies', id, 'dashboard']);
  }

  createCompany(): void {
    this.router.navigate(['/admin/companies/new']);
  }

  getStatusBadgeClass(status: CompanyStatus): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'suspended': return 'badge-danger';
      case 'inactive': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getSubscriptionBadgeClass(daysRemaining: number): string {
    if (daysRemaining <= 0) return 'badge-danger';
    if (daysRemaining <= 7) return 'badge-warning';
    return 'badge-success';
  }

  getUsagePercentage(used: number, max: number): number {
    return max > 0 ? Math.round((used / max) * 100) : 0;
  }

  getUsageBarClass(percentage: number): string {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  }

  getPaginationArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
