// payments.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentsService } from '../../services/payments/payments.service';
import {
  PaymentResponseDto,
  PaymentQueryDto,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS
} from '../../interfaces/payment.interfaces';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import { CreditCard, Plus, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit {
  readonly CreditCardIcon = CreditCard;
  readonly PlusIcon = Plus;

  payments = signal<PaymentResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Configuración de tabla
  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'paymentNumber',
      header: 'N° Pago',
      width: '130px'
    },
    {
      field: 'type',
      header: 'Tipo',
      width: '130px',
      customRender: (rowData: PaymentResponseDto) => {
        const icon = rowData.type === 'INBOUND' ? '↓' : '↑';
        return `${icon} ${PAYMENT_TYPE_LABELS[rowData.type]}`;
      }
    },
    {
      field: 'status',
      header: 'Estado',
      width: '120px',
      customRender: (rowData: PaymentResponseDto) => PAYMENT_STATUS_LABELS[rowData.status]
    },
    {
      field: 'paymentMethod',
      header: 'Método',
      width: '150px',
      customRender: (rowData: PaymentResponseDto) => PAYMENT_METHOD_LABELS[rowData.paymentMethod]
    },
    {
      field: 'paymentDate',
      header: 'Fecha',
      width: '120px',
      customRender: (rowData: PaymentResponseDto) => this.formatDate(rowData.paymentDate)
    },
    {
      field: 'amount',
      header: 'Monto',
      width: '130px',
      align: 'right',
      customRender: (rowData: PaymentResponseDto) => this.formatCurrency(rowData.amount, rowData.currency)
    },
    {
      field: 'transactionReference',
      header: 'Referencia',
      width: '150px',
      customRender: (rowData: PaymentResponseDto) => rowData.transactionReference || '-'
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '200px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          tooltip: 'Ver detalle',
          command: (rowData: PaymentResponseDto) => this.viewPayment(rowData)
        },
        {
          label: 'Procesar',
          icon: 'edit',
          severity: 'success',
          tooltip: 'Procesar pago',
          command: (rowData: PaymentResponseDto) => this.processPayment(rowData),
          visible: (rowData: PaymentResponseDto) => rowData.isPending
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar pago',
          command: (rowData: PaymentResponseDto) => this.editPayment(rowData),
          visible: (rowData: PaymentResponseDto) => rowData.isPending
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar pago',
          command: (rowData: PaymentResponseDto) => this.deletePayment(rowData),
          visible: (rowData: PaymentResponseDto) => rowData.isPending || rowData.status === 'FAILED'
        }
      ]
    }
  ]);

  readonly tableConfig = signal<TableConfig>({
    showPaginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    responsive: true,
    dataKey: 'id',
    emptyMessage: 'No hay pagos registrados',
    tableStyleClass: 'table-hover'
  });

  createButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Nuevo Pago',
    iconPosition: 'left'
  };

  constructor(
    private paymentsService: PaymentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: PaymentQueryDto = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: 'paymentDate',
      sortOrder: 'DESC'
    };

    this.paymentsService.getPayments(params).subscribe({
      next: (response) => {
        this.payments.set(response.data || []);
        this.totalItems = response.pagination?.total || 0;
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al cargar pagos');
        this.loading.set(false);
        console.error('Error loading payments:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadPayments();
  }

  createPayment(): void {
    this.router.navigate(['/payments/new']);
  }

  viewPayment(payment: PaymentResponseDto): void {
    this.router.navigate(['/payments', payment.id]);
  }

  editPayment(payment: PaymentResponseDto): void {
    this.router.navigate(['/payments', payment.id, 'edit']);
  }

  processPayment(payment: PaymentResponseDto): void {
    if (!confirm(`¿Está seguro de procesar el pago ${payment.paymentNumber}?`)) {
      return;
    }

    const userId = localStorage.getItem('user_id') || '';

    this.paymentsService.processPayment(payment.id, { processedBy: userId }).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (error) => {
        alert(error.message || 'Error al procesar pago');
      }
    });
  }

  deletePayment(payment: PaymentResponseDto): void {
    if (!confirm(`¿Está seguro de eliminar el pago ${payment.paymentNumber}?`)) {
      return;
    }

    this.paymentsService.deletePayment(payment.id).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar pago');
      }
    });
  }

  // ===== UTILIDADES =====

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatCurrency(amount: number, currency: string = 'CLP'): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    return PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || '#6b7280';
  }
}
