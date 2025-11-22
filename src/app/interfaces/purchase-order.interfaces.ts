// purchase-order.interfaces.ts
// Interfaces y tipos para el módulo de Órdenes de Compra

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT_TO_SUPPLIER'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type PurchaseOrderType =
  | 'STANDARD'
  | 'URGENT'
  | 'BLANKET'
  | 'SERVICE';

// ==================== RESPONSE DTOs ====================

export interface PurchaseOrderItemResponseDto {
  id: string;
  purchaseOrderId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  totalPrice: number;
  receivedQuantity: number;
  pendingQuantity: number;
  isFullyReceived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierDataSnapshot {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PurchaseOrderResponseDto {
  id: string;
  companyId: string;
  orderNumber: string;
  supplierId: string;
  type: PurchaseOrderType;
  status: PurchaseOrderStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;

  // Campos de aprobación
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;

  // Campos de envío
  sentToSupplierAt?: Date;
  sentBy?: string;

  // Campos de recepción
  receiptPercentage: number;
  firstReceivedAt?: Date;
  fullyReceivedAt?: Date;

  // Campos de cancelación
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;

  // Snapshot de datos del proveedor
  supplierData?: SupplierDataSnapshot;

  // Relaciones
  items: PurchaseOrderItemResponseDto[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Campos calculados (helpers)
  isDraft: boolean;
  isPendingApproval: boolean;
  isApproved: boolean;
  isSentToSupplier: boolean;
  isPartiallyReceived: boolean;
  isFullyReceived: boolean;
  isCancelled: boolean;
  canBeEdited: boolean;
  canBeApproved: boolean;
  canBeSent: boolean;
  canBeReceived: boolean;
  canBeCancelled: boolean;
}

// ==================== CREATE DTOs ====================

export interface CreatePurchaseOrderItemDto {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  type: PurchaseOrderType;
  currency?: string;
  expectedDeliveryDate?: Date | string;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
}

// ==================== UPDATE DTOs ====================

export interface UpdatePurchaseOrderDto {
  supplierId?: string;
  type?: PurchaseOrderType;
  currency?: string;
  expectedDeliveryDate?: Date | string;
  notes?: string;
}

export interface UpdatePurchaseOrderItemDto {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxPercentage?: number;
}

// ==================== ACTION DTOs ====================

export interface SubmitForApprovalDto {
  submittedBy: string;
  notes?: string;
}

export interface ApprovePurchaseOrderDto {
  approvedBy: string;
  approvalNotes?: string;
}

export interface SendToSupplierDto {
  sentBy: string;
  notes?: string;
}

export interface ReceiveItemDto {
  itemId: string;
  receivedQuantity: number;
  receivedBy: string;
  notes?: string;
}

export interface CancelPurchaseOrderDto {
  cancelledBy: string;
  reason: string;
}

// ==================== QUERY DTOs ====================

export interface PurchaseOrderQueryDto {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  type?: PurchaseOrderType;
  supplierId?: string;
  orderNumber?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== STATS DTOs ====================

export interface PurchaseOrderStatsDto {
  totalOrders: number;
  totalAmount: number;
  byStatus: {
    status: PurchaseOrderStatus;
    count: number;
    totalAmount: number;
  }[];
  byType: {
    type: PurchaseOrderType;
    count: number;
    totalAmount: number;
  }[];
  averageOrderValue: number;
  pendingApprovalCount: number;
  pendingReceiptCount: number;
}

// ==================== API RESPONSE WRAPPER ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== CONSTANTES ====================

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  'DRAFT': 'Borrador',
  'PENDING_APPROVAL': 'Pendiente de Aprobación',
  'APPROVED': 'Aprobada',
  'SENT_TO_SUPPLIER': 'Enviada a Proveedor',
  'PARTIALLY_RECEIVED': 'Parcialmente Recibida',
  'RECEIVED': 'Recibida Completa',
  'CANCELLED': 'Cancelada'
};

export const PURCHASE_ORDER_TYPE_LABELS: Record<PurchaseOrderType, string> = {
  'STANDARD': 'Estándar',
  'URGENT': 'Urgente',
  'BLANKET': 'Marco',
  'SERVICE': 'Servicio'
};

export const PURCHASE_ORDER_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  'DRAFT': '#6b7280',
  'PENDING_APPROVAL': '#f59e0b',
  'APPROVED': '#3b82f6',
  'SENT_TO_SUPPLIER': '#8b5cf6',
  'PARTIALLY_RECEIVED': '#06b6d4',
  'RECEIVED': '#10b981',
  'CANCELLED': '#ef4444'
};

export const PURCHASE_ORDER_TYPE_COLORS: Record<PurchaseOrderType, string> = {
  'STANDARD': '#6b7280',
  'URGENT': '#ef4444',
  'BLANKET': '#8b5cf6',
  'SERVICE': '#06b6d4'
};

// ==================== UTILIDADES ====================

export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  taxPercentage: number = 0
): number {
  const subtotal = quantity * unitPrice;
  const tax = subtotal * (taxPercentage / 100);
  return subtotal + tax;
}

export function calculateOrderTotals(items: CreatePurchaseOrderItemDto[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  let subtotal = 0;
  let tax = 0;

  items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = itemSubtotal * ((item.taxPercentage || 0) / 100);

    subtotal += itemSubtotal;
    tax += itemTax;
  });

  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}

export function calculateReceiptPercentage(items: PurchaseOrderItemResponseDto[]): number {
  if (!items || items.length === 0) return 0;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const receivedQuantity = items.reduce((sum, item) => sum + item.receivedQuantity, 0);

  if (totalQuantity === 0) return 0;

  return Math.round((receivedQuantity / totalQuantity) * 100);
}
