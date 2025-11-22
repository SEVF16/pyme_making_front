// ============================================
// POS Module Interfaces
// ============================================

// ============================================
// ENUMS
// ============================================

export enum POSSaleStatus {
  OPEN = 'OPEN',
  AWAITING_INVOICE = 'AWAITING_INVOICE',
  AWAITING_SII_CONFIRMATION = 'AWAITING_SII_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum POSPaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  MULTIPLE = 'MULTIPLE',
  OTHER = 'OTHER'
}

export enum POSSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CLOSED_WITH_DISCREPANCY = 'CLOSED_WITH_DISCREPANCY'
}

// ============================================
// AUXILIARY INTERFACES
// ============================================

export interface CustomerData {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
}

export interface PaymentDetails {
  cash?: number;
  card?: number;
  transfer?: number;
  other?: number;
}

export interface CashMovement {
  amount: number;
  reason: string;
  timestamp: Date | string;
  authorizedBy: string;
}

// ============================================
// REQUEST DTOs - POS SALES
// ============================================

export interface CreatePOSSaleItemDto {
  productId?: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  notes?: string;
}

export interface CreatePOSSaleDto {
  companyId: string;
  sessionId?: string;
  customerId?: string;
  saleNumber?: string;
  paymentMethod: POSPaymentMethod;
  customerData?: CustomerData;
  amountReceived?: number;
  paymentDetails?: PaymentDetails;
  transactionReference?: string;
  notes?: string;
  cashierId?: string;
  cashierName?: string;
  items: CreatePOSSaleItemDto[];
}

export interface UpdatePOSSaleDto {
  paymentMethod?: POSPaymentMethod;
  amountReceived?: number;
  paymentDetails?: PaymentDetails;
  transactionReference?: string;
  notes?: string;
  items?: CreatePOSSaleItemDto[];
}

export interface CompletePOSSaleDto {
  amountReceived?: number;
  paymentMethod?: POSPaymentMethod;
  paymentDetails?: PaymentDetails;
  transactionReference?: string;
  cashierId?: string;
  cashierName?: string;
}

export interface CancelPOSSaleDto {
  reason?: string;
}

export interface RefundPOSSaleDto {
  reason?: string;
  partialAmount?: number;
  refundMethod?: string;
}

// ============================================
// REQUEST DTOs - POS SESSIONS
// ============================================

export interface OpenPOSSessionDto {
  companyId: string;
  posTerminalId: string;
  posTerminalName: string;
  openedBy: string;
  openedByName: string;
  openingCash: number;
  openingNotes?: string;
}

export interface ClosePOSSessionDto {
  actualClosingCash: number;
  closedBy: string;
  closedByName: string;
  closingNotes?: string;
}

// ============================================
// RESPONSE DTOs - POS SALES
// ============================================

export interface POSSaleItemResponseDto {
  id: string;
  saleId: string;
  productId?: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountPercentage?: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  notes?: string;
}

export interface POSSaleResponseDto {
  id: string;
  companyId: string;
  saleNumber: string;
  sessionId?: string;
  status: POSSaleStatus;
  paymentMethod: POSPaymentMethod;
  customerId?: string;
  customerData?: CustomerData;
  saleDate: Date | string;
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  refundedAt?: Date | string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountReceived: number;
  changeGiven: number;
  paymentDetails?: PaymentDetails;
  transactionReference?: string;
  notes?: string;
  cashierId?: string;
  cashierName?: string;
  cancellationReason?: string;
  items: POSSaleItemResponseDto[];
  itemCount: number;
  totalUnits: number;
  isCompleted: boolean;
  canBeRefunded: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// RESPONSE DTOs - POS SESSIONS
// ============================================

export interface POSSessionResponseDto {
  id: string;
  companyId: string;
  sessionNumber: string;
  posTerminalId: string;
  posTerminalName: string;
  status: POSSessionStatus;
  openedBy: string;
  openedByName: string;
  closedBy?: string;
  closedByName?: string;
  openedAt: Date | string;
  closedAt?: Date | string;
  openingCash: number;
  expectedClosingCash: number;
  actualClosingCash?: number;
  cashDiscrepancy: number;
  totalCashSales: number;
  totalCardSales: number;
  totalTransferSales: number;
  totalOtherSales: number;
  totalSales: number;
  transactionCount: number;
  cancelledSalesCount: number;
  refundCount: number;
  cashWithdrawals?: CashMovement[];
  cashDeposits?: CashMovement[];
  openingNotes?: string;
  closingNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// STATISTICS DTOs
// ============================================

export interface POSSalesStatsDto {
  totalSales: number;
  totalAmount: number;
  averageTicket: number;
  completedSales: number;
  cancelledSales: number;
  refundedSales: number;
  byPaymentMethod: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export interface POSSessionsStatsDto {
  totalSessions: number;
  openSessions: number;
  closedSessions: number;
  sessionsWithDiscrepancy: number;
  totalSalesAmount: number;
  averageSalesPerSession: number;
  totalCashDiscrepancy: number;
  discrepancyRate: number;
}

export interface SalesByPaymentMethodDto {
  [paymentMethod: string]: {
    count: number;
    totalAmount: number;
    percentage: number;
  };
}

// ============================================
// QUERY DTOs
// ============================================

export interface POSSaleQueryDto {
  page?: number;
  limit?: number;
  status?: POSSaleStatus;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: POSPaymentMethod;
  search?: string;
}

export interface POSSessionQueryDto {
  page?: number;
  limit?: number;
  status?: POSSessionStatus;
  posTerminalId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// LABELS AND COLORS
// ============================================

export const POS_SALE_STATUS_LABELS: Record<POSSaleStatus, string> = {
  [POSSaleStatus.OPEN]: 'Abierta',
  [POSSaleStatus.AWAITING_INVOICE]: 'Esperando Boleta',
  [POSSaleStatus.AWAITING_SII_CONFIRMATION]: 'Esperando SII',
  [POSSaleStatus.COMPLETED]: 'Completada',
  [POSSaleStatus.CANCELLED]: 'Cancelada',
  [POSSaleStatus.REFUNDED]: 'Reembolsada'
};

export const POS_SALE_STATUS_COLORS: Record<POSSaleStatus, string> = {
  [POSSaleStatus.OPEN]: '#3b82f6',
  [POSSaleStatus.AWAITING_INVOICE]: '#f59e0b',
  [POSSaleStatus.AWAITING_SII_CONFIRMATION]: '#f59e0b',
  [POSSaleStatus.COMPLETED]: '#10b981',
  [POSSaleStatus.CANCELLED]: '#6b7280',
  [POSSaleStatus.REFUNDED]: '#ef4444'
};

export const POS_PAYMENT_METHOD_LABELS: Record<POSPaymentMethod, string> = {
  [POSPaymentMethod.CASH]: 'Efectivo',
  [POSPaymentMethod.CARD]: 'Tarjeta',
  [POSPaymentMethod.TRANSFER]: 'Transferencia',
  [POSPaymentMethod.MULTIPLE]: 'Múltiple',
  [POSPaymentMethod.OTHER]: 'Otro'
};

export const POS_PAYMENT_METHOD_COLORS: Record<POSPaymentMethod, string> = {
  [POSPaymentMethod.CASH]: '#10b981',
  [POSPaymentMethod.CARD]: '#3b82f6',
  [POSPaymentMethod.TRANSFER]: '#8b5cf6',
  [POSPaymentMethod.MULTIPLE]: '#f59e0b',
  [POSPaymentMethod.OTHER]: '#6b7280'
};

export const POS_SESSION_STATUS_LABELS: Record<POSSessionStatus, string> = {
  [POSSessionStatus.OPEN]: 'Abierta',
  [POSSessionStatus.CLOSED]: 'Cerrada',
  [POSSessionStatus.CLOSED_WITH_DISCREPANCY]: 'Cerrada con Discrepancia'
};

export const POS_SESSION_STATUS_COLORS: Record<POSSessionStatus, string> = {
  [POSSessionStatus.OPEN]: '#10b981',
  [POSSessionStatus.CLOSED]: '#6b7280',
  [POSSessionStatus.CLOSED_WITH_DISCREPANCY]: '#ef4444'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calcula el total de una venta a partir de sus items
 */
export function calculateSaleTotal(items: CreatePOSSaleItemDto[]): {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    let itemDiscount = 0;

    if (item.discountPercentage) {
      itemDiscount = itemSubtotal * (item.discountPercentage / 100);
    } else if (item.discountAmount) {
      itemDiscount = item.discountAmount;
    }

    const itemNeto = itemSubtotal - itemDiscount;
    const itemTax = itemNeto * ((item.taxRate || 19) / 100);

    subtotal += itemSubtotal;
    discountTotal += itemDiscount;
    taxTotal += itemTax;
  });

  const total = subtotal - discountTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    taxTotal,
    total
  };
}

/**
 * Calcula el vuelto a entregar al cliente
 */
export function calculateChange(total: number, amountReceived: number): number {
  return Math.max(0, amountReceived - total);
}

/**
 * Valida si una venta puede ser completada
 */
export function canCompleteSale(sale: POSSaleResponseDto): boolean {
  return sale.status === POSSaleStatus.OPEN && sale.items.length > 0;
}

/**
 * Valida si una venta puede ser cancelada
 */
export function canCancelSale(sale: POSSaleResponseDto): boolean {
  return sale.status === POSSaleStatus.OPEN;
}

/**
 * Valida si una venta puede ser reembolsada
 */
export function canRefundSale(sale: POSSaleResponseDto): boolean {
  return sale.status === POSSaleStatus.COMPLETED;
}

/**
 * Valida si una venta puede ser editada
 */
export function canEditSale(sale: POSSaleResponseDto): boolean {
  return sale.status === POSSaleStatus.OPEN;
}

/**
 * Valida si una venta puede ser eliminada
 */
export function canDeleteSale(sale: POSSaleResponseDto): boolean {
  return sale.status === POSSaleStatus.OPEN;
}

/**
 * Valida si una sesión puede ser cerrada
 */
export function canCloseSession(session: POSSessionResponseDto): boolean {
  return session.status === POSSessionStatus.OPEN;
}

/**
 * Obtiene el color de discrepancia según el monto
 */
export function getDiscrepancyColor(discrepancy: number): string {
  if (discrepancy === 0) return '#10b981'; // verde
  if (Math.abs(discrepancy) < 1000) return '#f59e0b'; // amarillo
  return '#ef4444'; // rojo
}

/**
 * Formatea un método de pago para visualización
 */
export function formatPaymentMethod(method: POSPaymentMethod): string {
  return POS_PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Formatea un estado de venta para visualización
 */
export function formatSaleStatus(status: POSSaleStatus): string {
  return POS_SALE_STATUS_LABELS[status] || status;
}

/**
 * Formatea un estado de sesión para visualización
 */
export function formatSessionStatus(status: POSSessionStatus): string {
  return POS_SESSION_STATUS_LABELS[status] || status;
}

/**
 * Valida si el pago es suficiente
 */
export function isPaymentSufficient(total: number, amountReceived: number): boolean {
  return amountReceived >= total;
}

/**
 * Calcula el porcentaje de una parte respecto al total
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}
