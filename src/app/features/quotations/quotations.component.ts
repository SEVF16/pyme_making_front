// quotations.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuotationsService } from '../../services/quotations/quotations.service';
import {
  QuotationResponseDto,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  getExpiryColor
} from '../../interfaces/quotation.interfaces';
import { CustomDataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { TableColumn } from '../../shared/components/data-table/interfaces/datatable.interface';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import { Plus, Eye, Edit, Trash2, Send, CheckCircle, XCircle, FileText, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.scss'
})
export class QuotationsComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly SendIcon = Send;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly FileTextIcon = FileText;

  quotations = signal<QuotationResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal<number>(1);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);

  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'quotationNumber',
      header: 'N° Cotización',
      width: '150px',
      sortable: true
    },
    {
      field: 'status',
      header: 'Estado',
      width: '150px',
      customRender: (rowData: QuotationResponseDto) => {
        const label = QUOTATION_STATUS_LABELS[rowData.status];
        const color = QUOTATION_STATUS_COLORS[rowData.status];
        return `
          <span style="
            background-color: ${color};
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
          ">${label}</span>
        `;
      }
    },
    {
      field: 'customerData',
      header: 'Cliente',
      width: '200px',
      customRender: (rowData: QuotationResponseDto) => {
        return rowData.customerData?.name || '-';
      }
    },
    {
      field: 'issueDate',
      header: 'Fecha Emisión',
      width: '130px',
      customRender: (rowData: QuotationResponseDto) => {
        return this.formatDate(rowData.issueDate);
      }
    },
    {
      field: 'validUntil',
      header: 'Válida Hasta',
      width: '130px',
      customRender: (rowData: QuotationResponseDto) => {
        return this.formatDate(rowData.validUntil);
      }
    },
    {
      field: 'daysUntilExpiry',
      header: 'Días Restantes',
      width: '150px',
      customRender: (rowData: QuotationResponseDto) => {
        const color = getExpiryColor(rowData.daysUntilExpiry, rowData.isExpired);
        const text = rowData.isExpired
          ? 'Expirada'
          : `${rowData.daysUntilExpiry} días`;

        return `
          <span style="
            color: ${color};
            font-weight: 600;
            font-size: 0.875rem;
          ">${text}</span>
        `;
      }
    },
    {
      field: 'total',
      header: 'Total',
      width: '150px',
      customRender: (rowData: QuotationResponseDto) => {
        return this.formatCurrency(rowData.total, rowData.currency);
      }
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '200px',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          command: (rowData: QuotationResponseDto) => this.viewQuotation(rowData)
        },
        {
          label: 'Enviar',
          icon: 'send',
          command: (rowData: QuotationResponseDto) => this.sendQuotation(rowData),
          disabled: (rowData: QuotationResponseDto) => rowData.status !== 'DRAFT' || rowData.isExpired
        },
        {
          label: 'Aceptar',
          icon: 'check-circle',
          command: (rowData: QuotationResponseDto) => this.acceptQuotation(rowData),
          disabled: (rowData: QuotationResponseDto) => rowData.status !== 'SENT' || rowData.isExpired
        },
        {
          label: 'Convertir',
          icon: 'file-text',
          command: (rowData: QuotationResponseDto) => this.convertToInvoice(rowData),
          disabled: (rowData: QuotationResponseDto) => rowData.status !== 'ACCEPTED'
        },
        {
          label: 'Editar',
          icon: 'edit',
          command: (rowData: QuotationResponseDto) => this.editQuotation(rowData),
          disabled: (rowData: QuotationResponseDto) => rowData.status !== 'DRAFT'
        },
        {
          label: 'Eliminar',
          icon: 'trash-2',
          command: (rowData: QuotationResponseDto) => this.deleteQuotation(rowData),
          disabled: (rowData: QuotationResponseDto) => rowData.status !== 'DRAFT'
        }
      ]
    }
  ]);

  newQuotationButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Nueva Cotización',
    iconPosition: 'left'
  };

  constructor(
    private quotationsService: QuotationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const companyId = localStorage.getItem('tenant_id') || '';

    this.quotationsService.getQuotations({
      page,
      pageSize: this.pageSize(),
      companyId
    }).subscribe({
      next: (response) => {
        this.quotations.set(response.result);
        this.totalRecords.set(response.result.length);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar las cotizaciones');
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    const page = event.page + 1;
    this.loadQuotations(page);
  }

  viewQuotation(quotation: QuotationResponseDto): void {
    this.router.navigate(['/quotations', quotation.id]);
  }

  sendQuotation(quotation: QuotationResponseDto): void {
    if (!confirm(`¿Está seguro de enviar la cotización ${quotation.quotationNumber} al cliente?`)) {
      return;
    }

    this.quotationsService.sendQuotation(quotation.id).subscribe({
      next: () => {
        this.loadQuotations(this.currentPage());
      },
      error: (error) => {
        alert(error.message || 'Error al enviar la cotización');
      }
    });
  }

  acceptQuotation(quotation: QuotationResponseDto): void {
    if (!confirm(`¿Está seguro de aceptar la cotización ${quotation.quotationNumber}?`)) {
      return;
    }

    this.quotationsService.acceptQuotation(quotation.id).subscribe({
      next: () => {
        this.loadQuotations(this.currentPage());
      },
      error: (error) => {
        alert(error.message || 'Error al aceptar la cotización');
      }
    });
  }

  convertToInvoice(quotation: QuotationResponseDto): void {
    if (!confirm(`¿Está seguro de convertir la cotización ${quotation.quotationNumber} a factura?`)) {
      return;
    }

    this.quotationsService.convertToInvoice(quotation.id).subscribe({
      next: (result) => {
        alert(`Cotización convertida exitosamente. ID de factura: ${result.convertedToInvoiceId}`);
        this.loadQuotations(this.currentPage());
      },
      error: (error) => {
        alert(error.message || 'Error al convertir la cotización');
      }
    });
  }

  editQuotation(quotation: QuotationResponseDto): void {
    this.router.navigate(['/quotations', quotation.id, 'edit']);
  }

  deleteQuotation(quotation: QuotationResponseDto): void {
    if (!confirm(`¿Está seguro de eliminar la cotización ${quotation.quotationNumber}?`)) {
      return;
    }

    this.quotationsService.deleteQuotation(quotation.id).subscribe({
      next: () => {
        this.loadQuotations(this.currentPage());
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar la cotización');
      }
    });
  }

  createNewQuotation(): void {
    this.router.navigate(['/quotations/new']);
  }

  // ===== UTILIDADES =====

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
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
