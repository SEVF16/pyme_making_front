// purchase-orders.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseOrdersService } from '../../services/purchase-orders/purchase-orders.service';
import {
  PurchaseOrderResponseDto,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_TYPE_LABELS,
  PURCHASE_ORDER_STATUS_COLORS
} from '../../interfaces/purchase-order.interfaces';
import { CustomDataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { TableColumn, TableAction } from '../../shared/components/data-table/interfaces/datatable.interface';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import { Plus, Eye, Edit, Trash2, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

  purchaseOrders = signal<PurchaseOrderResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal<number>(1);
  totalRecords = signal<number>(0);
  pageSize = signal<number>(10);

  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'orderNumber',
      header: 'N° Orden',
      width: '150px',
      sortable: true
    },
    {
      field: 'type',
      header: 'Tipo',
      width: '120px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        const label = PURCHASE_ORDER_TYPE_LABELS[rowData.type];
        return `<span style="font-weight: 500;">${label}</span>`;
      }
    },
    {
      field: 'status',
      header: 'Estado',
      width: '180px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        const label = PURCHASE_ORDER_STATUS_LABELS[rowData.status];
        const color = PURCHASE_ORDER_STATUS_COLORS[rowData.status];
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
      field: 'supplierData',
      header: 'Proveedor',
      width: '200px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        return rowData.supplierData?.name || '-';
      }
    },
    {
      field: 'total',
      header: 'Total',
      width: '150px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        return this.formatCurrency(rowData.total, rowData.currency);
      }
    },
    {
      field: 'receiptPercentage',
      header: 'Recepción',
      width: '120px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        const percentage = rowData.receiptPercentage;
        let color = '#6b7280';
        if (percentage === 100) color = '#10b981';
        else if (percentage > 0) color = '#3b82f6';

        return `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="
              flex: 1;
              height: 8px;
              background-color: #e5e7eb;
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                width: ${percentage}%;
                height: 100%;
                background-color: ${color};
                transition: width 0.3s ease;
              "></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 500; color: ${color};">
              ${percentage}%
            </span>
          </div>
        `;
      }
    },
    {
      field: 'expectedDeliveryDate',
      header: 'Fecha Entrega',
      width: '150px',
      customRender: (rowData: PurchaseOrderResponseDto) => {
        return rowData.expectedDeliveryDate
          ? this.formatDate(rowData.expectedDeliveryDate)
          : '-';
      }
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '180px',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          command: (rowData: PurchaseOrderResponseDto) => this.viewPurchaseOrder(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          command: (rowData: PurchaseOrderResponseDto) => this.editPurchaseOrder(rowData),
          disabled: (rowData: PurchaseOrderResponseDto) => !rowData.canBeEdited
        },
        {
          label: 'Eliminar',
          icon: 'trash-2',
          command: (rowData: PurchaseOrderResponseDto) => this.deletePurchaseOrder(rowData),
          disabled: (rowData: PurchaseOrderResponseDto) => !rowData.isDraft
        }
      ]
    }
  ]);

  newPurchaseOrderButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Nueva Orden de Compra',
    iconPosition: 'left'
  };

  constructor(
    private purchaseOrdersService: PurchaseOrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.purchaseOrdersService.getPurchaseOrders({
      page,
      limit: this.pageSize()
    }).subscribe({
      next: (response) => {
        this.purchaseOrders.set(response.data);
        this.totalRecords.set(response.pagination.total);
        this.currentPage.set(response.pagination.page);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar las órdenes de compra');
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    const page = event.page + 1;
    this.loadPurchaseOrders(page);
  }

  viewPurchaseOrder(purchaseOrder: PurchaseOrderResponseDto): void {
    this.router.navigate(['/purchase-orders', purchaseOrder.id]);
  }

  editPurchaseOrder(purchaseOrder: PurchaseOrderResponseDto): void {
    this.router.navigate(['/purchase-orders', purchaseOrder.id, 'edit']);
  }

  deletePurchaseOrder(purchaseOrder: PurchaseOrderResponseDto): void {
    if (!confirm(`¿Está seguro de eliminar la orden ${purchaseOrder.orderNumber}?`)) {
      return;
    }

    this.purchaseOrdersService.deletePurchaseOrder(purchaseOrder.id).subscribe({
      next: () => {
        this.loadPurchaseOrders(this.currentPage());
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar la orden de compra');
      }
    });
  }

  createNewPurchaseOrder(): void {
    this.router.navigate(['/purchase-orders/new']);
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
