// purchase-order-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseOrdersService } from '../../../services/purchase-orders/purchase-orders.service';
import {
  PurchaseOrderResponseDto,
  PurchaseOrderItemResponseDto,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_TYPE_LABELS,
  PURCHASE_ORDER_STATUS_COLORS
} from '../../../interfaces/purchase-order.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import {
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Package,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss'
})
export class PurchaseOrderDetailComponent implements OnInit {
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly SendIcon = Send;
  readonly PackageIcon = Package;

  purchaseOrder = signal<PurchaseOrderResponseDto | null>(null);
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

  submitButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SendIcon,
    text: 'Enviar a Aprobación',
    iconPosition: 'left'
  };

  approveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.CheckCircleIcon,
    text: 'Aprobar',
    iconPosition: 'left'
  };

  sendButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SendIcon,
    text: 'Enviar a Proveedor',
    iconPosition: 'left'
  };

  receiveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PackageIcon,
    text: 'Recibir Ítems',
    iconPosition: 'left'
  };

  cancelButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XCircleIcon,
    text: 'Cancelar Orden',
    iconPosition: 'left'
  };

  constructor(
    private purchaseOrdersService: PurchaseOrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchaseOrder(id);
    }
  }

  loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.purchaseOrdersService.getPurchaseOrderById(id).subscribe({
      next: (response) => {
        this.purchaseOrder.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la orden de compra');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase-orders']);
  }

  editPurchaseOrder(): void {
    const po = this.purchaseOrder();
    if (po) {
      this.router.navigate(['/purchase-orders', po.id, 'edit']);
    }
  }

  deletePurchaseOrder(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    if (!confirm(`¿Está seguro de eliminar la orden ${po.orderNumber}?`)) {
      return;
    }

    this.purchaseOrdersService.deletePurchaseOrder(po.id).subscribe({
      next: () => {
        this.router.navigate(['/purchase-orders']);
      },
      error: (error) => {
        alert(error.message || 'Error al eliminar la orden de compra');
      }
    });
  }

  submitForApproval(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    if (!confirm(`¿Está seguro de enviar la orden ${po.orderNumber} a aprobación?`)) {
      return;
    }

    const userId = localStorage.getItem('user_id') || '';

    this.purchaseOrdersService.submitForApproval(po.id, { submittedBy: userId }).subscribe({
      next: () => {
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        alert(error.message || 'Error al enviar a aprobación');
      }
    });
  }

  approvePurchaseOrder(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    const approvalNotes = prompt('Notas de aprobación (opcional):');
    if (approvalNotes === null) return; // User cancelled

    const userId = localStorage.getItem('user_id') || '';

    this.purchaseOrdersService.approvePurchaseOrder(po.id, {
      approvedBy: userId,
      approvalNotes: approvalNotes || undefined
    }).subscribe({
      next: () => {
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        alert(error.message || 'Error al aprobar la orden');
      }
    });
  }

  sendToSupplier(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    if (!confirm(`¿Está seguro de enviar la orden ${po.orderNumber} al proveedor?`)) {
      return;
    }

    const userId = localStorage.getItem('user_id') || '';

    this.purchaseOrdersService.sendToSupplier(po.id, { sentBy: userId }).subscribe({
      next: () => {
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        alert(error.message || 'Error al enviar al proveedor');
      }
    });
  }

  receiveItems(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    // Simplified receive - in production, you might want a modal with a form
    const item = po.items.find(i => !i.isFullyReceived);
    if (!item) {
      alert('Todos los ítems ya han sido recibidos');
      return;
    }

    const quantityStr = prompt(
      `Recibir ítem: ${item.name}\nCantidad pendiente: ${item.pendingQuantity}\n\nIngrese cantidad a recibir:`
    );

    if (!quantityStr) return;

    const quantity = parseFloat(quantityStr);
    if (isNaN(quantity) || quantity <= 0 || quantity > item.pendingQuantity) {
      alert('Cantidad inválida');
      return;
    }

    const userId = localStorage.getItem('user_id') || '';

    this.purchaseOrdersService.receiveItems(po.id, {
      itemId: item.id,
      receivedQuantity: quantity,
      receivedBy: userId
    }).subscribe({
      next: () => {
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        alert(error.message || 'Error al recibir ítems');
      }
    });
  }

  cancelPurchaseOrder(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    const reason = prompt('Razón de la cancelación:');
    if (!reason) return;

    const userId = localStorage.getItem('user_id') || '';

    this.purchaseOrdersService.cancelPurchaseOrder(po.id, {
      cancelledBy: userId,
      reason
    }).subscribe({
      next: () => {
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        alert(error.message || 'Error al cancelar la orden');
      }
    });
  }

  // ===== UTILIDADES =====

  getStatusLabel(status: string): string {
    return PURCHASE_ORDER_STATUS_LABELS[status as keyof typeof PURCHASE_ORDER_STATUS_LABELS] || status;
  }

  getTypeLabel(type: string): string {
    return PURCHASE_ORDER_TYPE_LABELS[type as keyof typeof PURCHASE_ORDER_TYPE_LABELS] || type;
  }

  getStatusColor(status: string): string {
    return PURCHASE_ORDER_STATUS_COLORS[status as keyof typeof PURCHASE_ORDER_STATUS_COLORS] || '#6b7280';
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

  getItemReceiptPercentage(item: PurchaseOrderItemResponseDto): number {
    if (item.quantity === 0) return 0;
    return Math.round((item.receivedQuantity / item.quantity) * 100);
  }

  getItemReceiptColor(item: PurchaseOrderItemResponseDto): string {
    if (item.isFullyReceived) return '#10b981';
    if (item.receivedQuantity > 0) return '#3b82f6';
    return '#6b7280';
  }
}
