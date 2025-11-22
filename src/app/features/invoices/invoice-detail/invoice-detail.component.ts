// invoice-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoicesService } from '../../../services/invoices/invoices.service';
import {
  InvoiceResponseDto,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../interfaces/invoice.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { Edit, Trash2, Download, ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss'
})
export class InvoiceDetailComponent implements OnInit {
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly DownloadIcon = Download;
  readonly ArrowLeftIcon = ArrowLeft;

  invoice = signal<InvoiceResponseDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Botones
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

  downloadButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.DownloadIcon,
    text: 'Descargar PDF',
    iconPosition: 'left'
  };

  constructor(
    private invoicesService: InvoicesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    }
  }

  loadInvoice(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.invoicesService.getInvoiceById(id).subscribe({
      next: (response) => {
        this.invoice.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la factura');
        this.loading.set(false);
        console.error('Error loading invoice:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  editInvoice(): void {
    const inv = this.invoice();
    if (inv) {
      this.router.navigate(['/invoices', inv.id, 'edit']);
    }
  }

  deleteInvoice(): void {
    const inv = this.invoice();
    if (!inv) return;

    if (!confirm(`¿Está seguro de eliminar la factura ${inv.invoiceNumber}?`)) {
      return;
    }

    this.invoicesService.deleteInvoice(inv.id).subscribe({
      next: () => {
        this.router.navigate(['/invoices']);
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar factura');
      }
    });
  }

  downloadPDF(): void {
    const inv = this.invoice();
    if (!inv) return;

    this.invoicesService.downloadPDF(inv.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${inv.invoiceNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        alert('Error al descargar PDF');
      }
    });
  }

  // ===== UTILIDADES =====

  getStatusLabel(status: string): string {
    return INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] || status;
  }

  getTypeLabel(type: string): string {
    return INVOICE_TYPE_LABELS[type as keyof typeof INVOICE_TYPE_LABELS] || type;
  }

  getPaymentMethodLabel(method?: string): string {
    if (!method) return '-';
    return PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#6b7280',
      'sent': '#3b82f6',
      'paid': '#10b981',
      'overdue': '#ef4444',
      'cancelled': '#f97316',
      'refunded': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  canEdit(): boolean {
    const inv = this.invoice();
    return inv ? ['draft', 'sent'].includes(inv.status) : false;
  }

  canDelete(): boolean {
    const inv = this.invoice();
    return inv ? inv.status === 'draft' : false;
  }
}
