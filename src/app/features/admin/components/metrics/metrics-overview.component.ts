// metrics-overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin/admin.service';
import { MetricsOverview } from '../../../../interfaces/admin';

@Component({
  selector: 'app-metrics-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-overview.component.html',
  styleUrls: ['./metrics-overview.component.css']
})
export class MetricsOverviewComponent implements OnInit {
  metrics: MetricsOverview | null = null;
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading = true;
    this.adminService.getMetricsOverview().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métricas:', error);
        this.loading = false;
      }
    });
  }

  getPlanNames(): string[] {
    return this.metrics ? Object.keys(this.metrics.byPlan) : [];
  }

  getPlanCount(planName: string): number {
    return this.metrics?.byPlan[planName] || 0;
  }

  getActivePercentage(): number {
    if (!this.metrics || this.metrics.totalCompanies === 0) return 0;
    return Math.round((this.metrics.activeCompanies / this.metrics.totalCompanies) * 100);
  }

  getTrialPercentage(): number {
    if (!this.metrics || this.metrics.totalCompanies === 0) return 0;
    return Math.round((this.metrics.trialCompanies / this.metrics.totalCompanies) * 100);
  }
}
