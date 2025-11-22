// reporting.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportingService } from '../../services/reporting/reporting.service';
import {
  ExecutiveDashboardDto,
  SalesByPeriodDto,
  TopProductsDto,
  OverdueReceivablesDto,
  ValuedInventoryDto,
  ReportPeriod,
  ReportRequestDto,
  REPORT_PERIOD_LABELS,
  AGING_CATEGORY_LABELS,
  formatTrend,
  getTrendClass,
  getAgingColor
} from '../../interfaces/reporting.interfaces';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { SelectLibComponent } from '../../shared/components/select-lib/select-lib.component';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertCircle,
  Package,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonLibComponent,
    SelectLibComponent,
    LucideAngularModule
  ],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss'
})
export class ReportingComponent implements OnInit {
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly DollarSignIcon = DollarSign;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UsersIcon = Users;
  readonly AlertCircleIcon = AlertCircle;
  readonly PackageIcon = Package;

  // Estado activo de la vista
  activeView = signal<'dashboard' | 'sales' | 'products' | 'receivables' | 'inventory'>('dashboard');

  // Datos
  dashboard = signal<ExecutiveDashboardDto | null>(null);
  salesReport = signal<SalesByPeriodDto | null>(null);
  topProducts = signal<TopProductsDto | null>(null);
  overdueReceivables = signal<OverdueReceivablesDto | null>(null);
  inventory = signal<ValuedInventoryDto | null>(null);

  // Estado de carga
  loadingDashboard = signal<boolean>(false);
  loadingSales = signal<boolean>(false);
  loadingProducts = signal<boolean>(false);
  loadingReceivables = signal<boolean>(false);
  loadingInventory = signal<boolean>(false);

  // Errores
  errorDashboard = signal<string | null>(null);
  errorSales = signal<string | null>(null);
  errorProducts = signal<string | null>(null);
  errorReceivables = signal<string | null>(null);
  errorInventory = signal<string | null>(null);

  // Filtros
  selectedPeriod = signal<ReportPeriod>(ReportPeriod.THIS_MONTH);
  topProductsLimit = signal<number>(10);

  // Opciones para selects
  periodOptions = signal<{ value: string; label: string }[]>(
    Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  );

  limitOptions = signal<{ value: string; label: string }[]>([
    { value: '5', label: 'Top 5' },
    { value: '10', label: 'Top 10' },
    { value: '20', label: 'Top 20' },
    { value: '50', label: 'Top 50' }
  ]);

  refreshButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'sm',
    text: 'Actualizar',
    iconPosition: 'left'
  };

  constructor(private reportingService: ReportingService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ==================== CAMBIO DE VISTA ====================

  setActiveView(view: 'dashboard' | 'sales' | 'products' | 'receivables' | 'inventory'): void {
    this.activeView.set(view);

    // Cargar datos si no están cargados
    switch (view) {
      case 'dashboard':
        if (!this.dashboard()) this.loadDashboard();
        break;
      case 'sales':
        if (!this.salesReport()) this.loadSalesReport();
        break;
      case 'products':
        if (!this.topProducts()) this.loadTopProducts();
        break;
      case 'receivables':
        if (!this.overdueReceivables()) this.loadOverdueReceivables();
        break;
      case 'inventory':
        if (!this.inventory()) this.loadInventory();
        break;
    }
  }

  // ==================== CARGA DE DATOS ====================

  loadDashboard(): void {
    this.loadingDashboard.set(true);
    this.errorDashboard.set(null);

    const request: ReportRequestDto = {
      period: this.selectedPeriod()
    };

    this.reportingService.getExecutiveDashboard(request).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loadingDashboard.set(false);
      },
      error: (error) => {
        this.errorDashboard.set('Error al cargar el dashboard');
        this.loadingDashboard.set(false);
      }
    });
  }

  loadSalesReport(): void {
    this.loadingSales.set(true);
    this.errorSales.set(null);

    const request: ReportRequestDto = {
      period: this.selectedPeriod()
    };

    this.reportingService.getSalesByPeriod(request).subscribe({
      next: (data) => {
        this.salesReport.set(data);
        this.loadingSales.set(false);
      },
      error: (error) => {
        this.errorSales.set('Error al cargar el reporte de ventas');
        this.loadingSales.set(false);
      }
    });
  }

  loadTopProducts(): void {
    this.loadingProducts.set(true);
    this.errorProducts.set(null);

    const request = {
      period: this.selectedPeriod(),
      limit: this.topProductsLimit()
    };

    this.reportingService.getTopSellingProducts(request).subscribe({
      next: (data) => {
        this.topProducts.set(data);
        this.loadingProducts.set(false);
      },
      error: (error) => {
        this.errorProducts.set('Error al cargar productos más vendidos');
        this.loadingProducts.set(false);
      }
    });
  }

  loadOverdueReceivables(): void {
    this.loadingReceivables.set(true);
    this.errorReceivables.set(null);

    const request: ReportRequestDto = {
      period: this.selectedPeriod()
    };

    this.reportingService.getOverdueReceivables(request).subscribe({
      next: (data) => {
        this.overdueReceivables.set(data);
        this.loadingReceivables.set(false);
      },
      error: (error) => {
        this.errorReceivables.set('Error al cargar cuentas por cobrar');
        this.loadingReceivables.set(false);
      }
    });
  }

  loadInventory(): void {
    this.loadingInventory.set(true);
    this.errorInventory.set(null);

    this.reportingService.getValuedInventory().subscribe({
      next: (data) => {
        this.inventory.set(data);
        this.loadingInventory.set(false);
      },
      error: (error) => {
        this.errorInventory.set('Error al cargar inventario');
        this.loadingInventory.set(false);
      }
    });
  }

  // ==================== HANDLERS ====================

  onPeriodChange(): void {
    // Recargar el reporte activo
    switch (this.activeView()) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'sales':
        this.loadSalesReport();
        break;
      case 'products':
        this.loadTopProducts();
        break;
      case 'receivables':
        this.loadOverdueReceivables();
        break;
    }
  }

  onLimitChange(): void {
    this.loadTopProducts();
  }

  // ==================== UTILIDADES ====================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CL').format(value);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTrend(trend: number): string {
    return formatTrend(trend);
  }

  getTrendClass(trend: number): string {
    return getTrendClass(trend);
  }

  getTrendIcon(trend: number): any {
    return trend >= 0 ? this.TrendingUpIcon : this.TrendingDownIcon;
  }

  getAgingColor(category: string): string {
    return getAgingColor(category as any);
  }

  getAgingLabel(category: string): string {
    return AGING_CATEGORY_LABELS[category as keyof typeof AGING_CATEGORY_LABELS] || category;
  }
}
