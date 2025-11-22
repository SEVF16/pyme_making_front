// invoices.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoicesService } from '../../services/invoices/invoices.service';
import {
  InvoiceResponseDto,
  InvoiceQueryDto,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS
} from '../../interfaces/invoice.interfaces';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import { FileText, Plus, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  readonly FileTextIcon = FileText;
  readonly PlusIcon = Plus;

  invoices = signal<InvoiceResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Configuración de tabla
  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'invoiceNumber',
      header: 'N° Factura',
      width: '150px'
    },
    {
      field: 'type',
      header: 'Tipo',
      width: '150px',
      customRender: (rowData: InvoiceResponseDto) => INVOICE_TYPE_LABELS[rowData.type]
    },
    {
      field: 'customerData.name',
      header: 'Cliente',
      customRender: (rowData: InvoiceResponseDto) => rowData.customerData?.name || 'Consumidor Final'
    },
    {
      field: 'issueDate',
      header: 'Fecha Emisión',
      width: '130px',
      customRender: (rowData: InvoiceResponseDto) => this.formatDate(rowData.issueDate)
    },
    {
      field: 'dueDate',
      header: 'Fecha Vencimiento',
      width: '150px',
      customRender: (rowData: InvoiceResponseDto) =>
        rowData.dueDate ? this.formatDate(rowData.dueDate) : '-'
    },
    {
      field: 'total',
      header: 'Total',
      width: '130px',
      align: 'right',
      customRender: (rowData: InvoiceResponseDto) => this.formatCurrency(rowData.total)
    },
    {
      field: 'status',
      header: 'Estado',
      width: '120px',
      customRender: (rowData: InvoiceResponseDto) => INVOICE_STATUS_LABELS[rowData.status]
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '180px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          tooltip: 'Ver detalle',
          command: (rowData: InvoiceResponseDto) => this.viewInvoice(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar factura',
          command: (rowData: InvoiceResponseDto) => this.editInvoice(rowData),
          visible: (rowData: InvoiceResponseDto) => this.canEdit(rowData)
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar factura',
          command: (rowData: InvoiceResponseDto) => this.deleteInvoice(rowData),
          visible: (rowData: InvoiceResponseDto) => this.canDelete(rowData)
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
    emptyMessage: 'No hay facturas registradas',
    tableStyleClass: 'table-hover'
  });

  createButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Nueva Factura',
    iconPosition: 'left'
  };

  constructor(
    private invoicesService: InvoicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: InvoiceQueryDto = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };

    this.invoicesService.getInvoices(params).subscribe({
      next: (response) => {
        this.invoices.set(response.data || []);
        this.totalItems = response.pagination?.total || 0;
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al cargar facturas');
        this.loading.set(false);
        console.error('Error loading invoices:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadInvoices();
  }

  createInvoice(): void {
    this.router.navigate(['/invoices/new']);
  }

  viewInvoice(invoice: InvoiceResponseDto): void {
    this.router.navigate(['/invoices', invoice.id]);
  }

  editInvoice(invoice: InvoiceResponseDto): void {
    this.router.navigate(['/invoices', invoice.id, 'edit']);
  }

  deleteInvoice(invoice: InvoiceResponseDto): void {
    if (!confirm(`¿Está seguro de eliminar la factura ${invoice.invoiceNumber}?`)) {
      return;
    }

    this.invoicesService.deleteInvoice(invoice.id).subscribe({
      next: () => {
        this.loadInvoices();
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar factura');
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  canEdit(invoice: InvoiceResponseDto): boolean {
    return ['draft', 'sent'].includes(invoice.status);
  }

  canDelete(invoice: InvoiceResponseDto): boolean {
    return invoice.status === 'draft';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': 'gray',
      'sent': 'blue',
      'paid': 'green',
      'overdue': 'red',
      'cancelled': 'orange',
      'refunded': 'purple'
    };
    return colors[status] || 'gray';
  }
}
