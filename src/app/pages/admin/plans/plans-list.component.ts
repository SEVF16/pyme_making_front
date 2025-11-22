// plans-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';
import { Plan } from '../../../interfaces/admin';

@Component({
  selector: 'app-plans-list',
  templateUrl: './plans-list.component.html',
  styleUrls: ['./plans-list.component.css']
})
export class PlansListComponent implements OnInit {
  plans: Plan[] = [];
  loading = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.adminService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
        this.loading = false;
      }
    });
  }

  viewPlan(id: string): void {
    this.router.navigate(['/admin/plans', id]);
  }

  editPlan(id: string): void {
    this.router.navigate(['/admin/plans', id, 'edit']);
  }

  createPlan(): void {
    this.router.navigate(['/admin/plans/new']);
  }

  getTierLabel(tier: number): string {
    switch (tier) {
      case 1: return 'Free';
      case 2: return 'Pro';
      case 3: return 'Enterprise';
      default: return `Tier ${tier}`;
    }
  }
}
