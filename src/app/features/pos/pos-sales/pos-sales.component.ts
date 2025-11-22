import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { POSSalesService } from '../../../services/pos/pos-sales.service';
import {
  POSSaleResponseDto,
  POSSaleStatus,
  POSPaymentMethod,
  POS_SALE_STATUS_LABELS,
  POS_SALE_STATUS_COLORS,
  POS_PAYMENT_METHOD_LABELS
} from '../../../interfaces/pos.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { Plus, Eye, LucideAngularModule } from 'lucide-angular';
import { CustomDataTableComponent } from '../../../shared/components/data-table/custom-data-table.component';

@Component({
  selector: 'app-pos-sales',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-sales.component.html',
  styleUrl: './pos-sales.component.scss'
})
export class POSSalesComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EyeIcon = Eye;

  sales = signal<POSSaleResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);

  // Filtros
  selectedStatus = signal<POSSaleStatus | 'ALL'>('ALL');
  selectedPaymentMethod = signal<POSPaymentMethod | 'ALL'>('ALL');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Opciones para filtros
  statusOptions = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: POSSaleStatus.OPEN, label: POS_SALE_STATUS_LABELS[POSSaleStatus.OPEN] },
    { value: POSSaleStatus.AWAITING_INVOICE, label: POS_SALE_STATUS_LABELS[POSSaleStatus.AWAITING_INVOICE] },
    { value: POSSaleStatus.AWAITING_SII_CONFIRMATION, label: POS_SALE_STATUS_LABELS[POSSaleStatus.AWAITING_SII_CONFIRMATION] },
    { value: POSSaleStatus.COMPLETED, label: POS_SALE_STATUS_LABELS[POSSaleStatus.COMPLETED] },
    { value: POSSaleStatus.CANCELLED, label: POS_SALE_STATUS_LABELS[POSSaleStatus.CANCELLED] },
    { value: POSSaleStatus.REFUNDED, label: POS_SALE_STATUS_LABELS[POSSaleStatus.REFUNDED] }
  ];

  paymentMethodOptions = [
    { value: 'ALL', label: 'Todos los métodos' },
    { value: POSPaymentMethod.CASH, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.CASH] },
    { value: POSPaymentMethod.CARD, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.CARD] },
    { value: POSPaymentMethod.TRANSFER, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.TRANSFER] },
    { value: POSPaymentMethod.MULTIPLE, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.MULTIPLE] },
    { value: POSPaymentMethod.OTHER, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.OTHER] }
  ];

  newSaleButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Nueva Venta',
    iconPosition: 'left'
  };

  columns: any[] = [
    {
      key: 'saleNumber',
      header: 'N° Venta',
      sortable: true,
      width: '120px'
    },
    {
      key: 'saleDate',
      header: 'Fecha',
      sortable: true,
      width: '140px',
      render: (row: POSSaleResponseDto) => this.formatDate(row.saleDate)
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: POSSaleResponseDto) => this.renderStatus(row.status)
    },
    {
      key: 'paymentMethod',
      header: 'Método de Pago',
      sortable: true,
      width: '140px',
      render: (row: POSSaleResponseDto) => POS_PAYMENT_METHOD_LABELS[row.paymentMethod]
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      width: '120px',
      align: 'right',
      render: (row: POSSaleResponseDto) => this.formatCurrency(row.total)
    },
    {
      key: 'itemCount',
      header: 'Items',
      sortable: true,
      width: '80px',
      align: 'center'
    },
    {
      key: 'cashierName',
      header: 'Cajero',
      sortable: true,
      width: '150px'
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: '100px',
      align: 'center',
      render: (row: POSSaleResponseDto) => this.renderActions(row)
    }
  ];

  constructor(
    private salesService: POSSalesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: any = {
      page: this.currentPage(),
      limit: this.pageSize()
    };

    if (this.selectedStatus() !== 'ALL') {
      query.status = this.selectedStatus();
    }

    if (this.selectedPaymentMethod() !== 'ALL') {
      query.paymentMethod = this.selectedPaymentMethod();
    }

    if (this.startDate()) {
      query.startDate = this.startDate();
    }

    if (this.endDate()) {
      query.endDate = this.endDate();
    }

    this.salesService.list(query).subscribe({
      next: (response) => {
        this.sales.set(response.data);
   
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar las ventas');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSales();
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as POSSaleStatus | 'ALL';
    this.selectedStatus.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onPaymentMethodFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as POSPaymentMethod | 'ALL';
    this.selectedPaymentMethod.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onStartDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDate.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onEndDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDate.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  clearFilters(): void {
    this.selectedStatus.set('ALL');
    this.selectedPaymentMethod.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.loadSales();
  }

  navigateToNew(): void {
    this.router.navigate(['/pos/sales/new']);
  }

  viewSale(sale: POSSaleResponseDto): void {
    this.router.navigate(['/pos/sales', sale.id]);
  }

  renderStatus(status: POSSaleStatus): string {
    const label = POS_SALE_STATUS_LABELS[status];
    const color = POS_SALE_STATUS_COLORS[status];
    return `<span class="status-badge" style="background-color: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${label}</span>`;
  }

  renderActions(sale: POSSaleResponseDto): string {
    return `<button class="action-button view-button" data-id="${sale.id}" title="Ver detalle">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>`;
  }

  onRowClick(sale: POSSaleResponseDto): void {
    this.viewSale(sale);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
