// payment-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentsService } from '../../../services/payments/payments.service';
import {
  PaymentResponseDto,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS
} from '../../../interfaces/payment.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { Edit, Trash2, ArrowLeft, CheckCircle, XCircle, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss'
})
export class PaymentDetailComponent implements OnInit {
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;

  payment = signal<PaymentResponseDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  backButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.ArrowLeftIcon,
    text: 'Volver',
    iconPosition: 'left'
  };

  editButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.EditIcon,
    text: 'Editar',
    iconPosition: 'left'
  };

  deleteButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.Trash2Icon,
    text: 'Eliminar',
    iconPosition: 'left'
  };

  processButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.CheckCircleIcon,
    text: 'Procesar Pago',
    iconPosition: 'left'
  };

  cancelButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XCircleIcon,
    text: 'Cancelar Pago',
    iconPosition: 'left'
  };

  constructor(
    private paymentsService: PaymentsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPayment(id);
    }
  }

  loadPayment(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentsService.getPaymentById(id).subscribe({
      next: (response) => {
        this.payment.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el pago');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/payments']);
  }

  editPayment(): void {
    const pmt = this.payment();
    if (pmt) {
      this.router.navigate(['/payments', pmt.id, 'edit']);
    }
  }

  deletePayment(): void {
    const pmt = this.payment();
    if (!pmt) return;

    if (!confirm(`¿Está seguro de eliminar el pago ${pmt.paymentNumber}?`)) {
      return;
    }

    this.paymentsService.deletePayment(pmt.id).subscribe({
      next: () => {
        this.router.navigate(['/payments']);
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar pago');
      }
    });
  }

  processPayment(): void {
    const pmt = this.payment();
    if (!pmt) return;

    if (!confirm(`¿Está seguro de procesar el pago ${pmt.paymentNumber}?`)) {
      return;
    }

    const userId = localStorage.getItem('user_id') || '';

    this.paymentsService.processPayment(pmt.id, { processedBy: userId }).subscribe({
      next: () => {
        this.loadPayment(pmt.id);
      },
      error: (error) => {
        alert(error.message || 'Error al procesar pago');
      }
    });
  }

  cancelPayment(): void {
    const pmt = this.payment();
    if (!pmt) return;

    const reason = prompt('Razón de la cancelación:');
    if (!reason) return;

    this.paymentsService.cancelPayment(pmt.id, { reason }).subscribe({
      next: () => {
        this.loadPayment(pmt.id);
      },
      error: (error) => {
        alert(error.message || 'Error al cancelar pago');
      }
    });
  }

  // ===== UTILIDADES =====

  getStatusLabel(status: string): string {
    return PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] || status;
  }

  getTypeLabel(type: string): string {
    return PAYMENT_TYPE_LABELS[type as keyof typeof PAYMENT_TYPE_LABELS] || type;
  }

  getMethodLabel(method: string): string {
    return PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method;
  }

  getStatusColor(status: string): string {
    return PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || '#6b7280';
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number, currency: string = 'CLP'): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
}
