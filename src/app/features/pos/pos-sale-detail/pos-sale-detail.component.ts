import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { POSSalesService } from '../../../services/pos/pos-sales.service';
import {
  POSSaleResponseDto,
  POS_SALE_STATUS_LABELS,
  POS_SALE_STATUS_COLORS,
  POS_PAYMENT_METHOD_LABELS,
  canCancelSale,
  canRefundSale
} from '../../../interfaces/pos.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, XCircle, RefreshCw, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pos-sale-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-sale-detail.component.html',
  styleUrl: './pos-sale-detail.component.scss'
})
export class POSSaleDetailComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly XCircleIcon = XCircle;
  readonly RefreshCwIcon = RefreshCw;

  sale = signal<POSSaleResponseDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  backButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.ArrowLeftIcon,
    text: 'Volver',
    iconPosition: 'left'
  };

  cancelButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XCircleIcon,
    text: 'Cancelar Venta',
    iconPosition: 'left'
  };

  refundButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.RefreshCwIcon,
    text: 'Reembolsar',
    iconPosition: 'left'
  };

  constructor(
    private salesService: POSSalesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSale(id);
    }
  }

  loadSale(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.salesService.getById(id).subscribe({
      next: (response) => {
        this.sale.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la venta');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pos/sales']);
  }

  canCancel(): boolean {
    const saleData = this.sale();
    return saleData ? canCancelSale(saleData) : false;
  }

  canRefund(): boolean {
    const saleData = this.sale();
    return saleData ? canRefundSale(saleData) : false;
  }

  cancelSale(): void {
    const saleData = this.sale();
    if (!saleData) return;

    const reason = prompt('Razón de cancelación (opcional):');
    if (reason === null) return; // User cancelled

    this.salesService.cancelSale(saleData.id, { reason: reason || undefined }).subscribe({
      next: () => {
        this.loadSale(saleData.id);
      },
      error: (error) => {
        alert(error.message || 'Error al cancelar la venta');
      }
    });
  }

  refundSale(): void {
    const saleData = this.sale();
    if (!saleData) return;

    if (!confirm(`¿Está seguro de reembolsar la venta ${saleData.saleNumber}?`)) {
      return;
    }

    const reason = prompt('Razón del reembolso (opcional):');
    if (reason === null) return; // User cancelled

    this.salesService.refundSale(saleData.id, { reason: reason || undefined }).subscribe({
      next: () => {
        alert('Venta reembolsada exitosamente');
        this.loadSale(saleData.id);
      },
      error: (error) => {
        alert(error.message || 'Error al reembolsar la venta');
      }
    });
  }

  getStatusLabel(status: string): string {
    return POS_SALE_STATUS_LABELS[status as keyof typeof POS_SALE_STATUS_LABELS] || status;
  }

  getStatusColor(status: string): string {
    return POS_SALE_STATUS_COLORS[status as keyof typeof POS_SALE_STATUS_COLORS] || '#6b7280';
  }

  getPaymentMethodLabel(method: string): string {
    return POS_PAYMENT_METHOD_LABELS[method as keyof typeof POS_PAYMENT_METHOD_LABELS] || method;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
