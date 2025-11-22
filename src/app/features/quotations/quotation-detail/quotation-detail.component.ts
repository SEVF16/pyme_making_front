// quotation-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuotationsService } from '../../../services/quotations/quotations.service';
import {
  QuotationResponseDto,
  QuotationItemResponseDto,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  getExpiryColor,
  canPerformAction
} from '../../../interfaces/quotation.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import {
  Edit,
  Trash2,
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './quotation-detail.component.html',
  styleUrl: './quotation-detail.component.scss'
})
export class QuotationDetailComponent implements OnInit {
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SendIcon = Send;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly FileTextIcon = FileText;

  quotation = signal<QuotationResponseDto | null>(null);
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

  sendButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SendIcon,
    text: 'Enviar al Cliente',
    iconPosition: 'left'
  };

  acceptButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.CheckCircleIcon,
    text: 'Aceptar',
    iconPosition: 'left'
  };

  rejectButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XCircleIcon,
    text: 'Rechazar',
    iconPosition: 'left'
  };

  convertButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.FileTextIcon,
    text: 'Convertir a Factura',
    iconPosition: 'left'
  };

  cancelButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XCircleIcon,
    text: 'Cancelar',
    iconPosition: 'left'
  };

  constructor(
    private quotationsService: QuotationsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuotation(id);
    }
  }

  loadQuotation(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.quotationsService.getQuotationById(id).subscribe({
      next: (response) => {
        this.quotation.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la cotización');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/quotations']);
  }

  editQuotation(): void {
    const quot = this.quotation();
    if (quot) {
      this.router.navigate(['/quotations', quot.id, 'edit']);
    }
  }

  deleteQuotation(): void {
    const quot = this.quotation();
    if (!quot) return;

    if (!confirm(`¿Está seguro de eliminar la cotización ${quot.quotationNumber}?`)) {
      return;
    }

    this.quotationsService.deleteQuotation(quot.id).subscribe({
      next: () => {
        this.router.navigate(['/quotations']);
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar la cotización');
      }
    });
  }

  sendQuotation(): void {
    const quot = this.quotation();
    if (!quot) return;

    if (!confirm(`¿Está seguro de enviar la cotización ${quot.quotationNumber} al cliente?`)) {
      return;
    }

    this.quotationsService.sendQuotation(quot.id).subscribe({
      next: () => {
        this.loadQuotation(quot.id);
      },
      error: (error) => {
        alert(error.message || 'Error al enviar la cotización');
      }
    });
  }

  acceptQuotation(): void {
    const quot = this.quotation();
    if (!quot) return;

    if (!confirm(`¿Está seguro de aceptar la cotización ${quot.quotationNumber}?`)) {
      return;
    }

    this.quotationsService.acceptQuotation(quot.id).subscribe({
      next: () => {
        this.loadQuotation(quot.id);
      },
      error: (error) => {
        alert(error.message || 'Error al aceptar la cotización');
      }
    });
  }

  rejectQuotation(): void {
    const quot = this.quotation();
    if (!quot) return;

    const reason = prompt('Razón del rechazo (opcional):');
    if (reason === null) return; // User cancelled

    this.quotationsService.rejectQuotation(quot.id, { reason: reason || undefined }).subscribe({
      next: () => {
        this.loadQuotation(quot.id);
      },
      error: (error) => {
        alert(error.message || 'Error al rechazar la cotización');
      }
    });
  }

  convertToInvoice(): void {
    const quot = this.quotation();
    if (!quot) return;

    if (!confirm(`¿Está seguro de convertir la cotización ${quot.quotationNumber} a factura?`)) {
      return;
    }

    this.quotationsService.convertToInvoice(quot.id).subscribe({
      next: (result) => {
        alert(`Cotización convertida exitosamente. ID de factura: ${result.convertedToInvoiceId}`);
        this.loadQuotation(quot.id);
      },
      error: (error) => {
        alert(error.message || 'Error al convertir la cotización');
      }
    });
  }

  cancelQuotation(): void {
    const quot = this.quotation();
    if (!quot) return;

    const reason = prompt('Razón de la cancelación (opcional):');
    if (reason === null) return; // User cancelled

    this.quotationsService.cancelQuotation(quot.id, { reason: reason || undefined }).subscribe({
      next: () => {
        this.loadQuotation(quot.id);
      },
      error: (error) => {
        alert(error.message || 'Error al cancelar la cotización');
      }
    });
  }

  // ===== UTILIDADES =====

  canPerformAction(action: string): boolean {
    const quot = this.quotation();
    if (!quot) return false;
    return canPerformAction(quot.status, action as any);
  }

  getStatusLabel(status: string): string {
    return QUOTATION_STATUS_LABELS[status as keyof typeof QUOTATION_STATUS_LABELS] || status;
  }

  getStatusColor(status: string): string {
    return QUOTATION_STATUS_COLORS[status as keyof typeof QUOTATION_STATUS_COLORS] || '#6b7280';
  }

  getPaymentMethodLabel(method: string | null): string {
    if (!method) return '-';
    return PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method;
  }

  getExpiryColor(): string {
    const quot = this.quotation();
    if (!quot) return '#6b7280';
    return getExpiryColor(quot.daysUntilExpiry, quot.isExpired);
  }

  getExpiryText(): string {
    const quot = this.quotation();
    if (!quot) return '-';
    return quot.isExpired ? 'Expirada' : `${quot.daysUntilExpiry} días`;
  }

  formatDate(date: Date | string | null): string {
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
