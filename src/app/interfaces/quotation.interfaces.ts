// quotation.interfaces.ts
// Interfaces y tipos para el módulo de Cotizaciones (Quotations)

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONVERTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CHECK'
  | 'DIGITAL_WALLET'
  | 'OTHER';

// ==================== RESPONSE DTOs ====================

export interface CustomerDataSnapshot {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuotationItemResponseDto {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;

  // Campos calculados
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  lineTotal: number;

  notes: string | null;
  sortOrder: number;
}

export interface QuotationResponseDto {
  // Identificación
  id: string;
  companyId: string;
  customerId: string;
  quotationNumber: string;

  // Estado y Fechas
  status: QuotationStatus;
  issueDate: Date;
  validUntil: Date;
  sentAt: Date | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  convertedAt: Date | null;

  // Información del Cliente (Snapshot)
  customerData: CustomerDataSnapshot | null;

  // Configuración
  currency: string;
  exchangeRate: number;
  paymentMethod: PaymentMethod | null;
  paymentTermsDays: number | null;

  // Descuentos Globales
  globalDiscountPercentage: number;
  globalDiscountAmount: number;

  // Totales (calculados automáticamente)
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;

  // Notas y Referencias
  notes: string | null;
  terms: string | null;
  internalNotes: string | null;
  rejectionReason: string | null;
  convertedToInvoiceId: string | null;
  convertedToSalesOrderId: string | null;

  // Items
  items: QuotationItemResponseDto[];

  // Campos Calculados (útiles para el frontend)
  daysUntilExpiry: number;
  isExpired: boolean;

  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

// ==================== CREATE DTOs ====================

export interface CreateQuotationItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  notes?: string;
}

export interface CreateQuotationDto {
  companyId: string;
  customerId: string;
  validUntil: Date | string;
  items: CreateQuotationItemDto[];
  issueDate?: Date | string;
  currency?: string;
  exchangeRate?: number;
  paymentMethod?: PaymentMethod;
  paymentTermsDays?: number;
  globalDiscountPercentage?: number;
  globalDiscountAmount?: number;
  notes?: string;
  terms?: string;
  internalNotes?: string;
}

// ==================== UPDATE DTOs ====================

export interface UpdateQuotationDto {
  customerId?: string;
  issueDate?: Date | string;
  validUntil?: Date | string;
  items?: CreateQuotationItemDto[];
  currency?: string;
  exchangeRate?: number;
  paymentMethod?: PaymentMethod;
  paymentTermsDays?: number;
  globalDiscountPercentage?: number;
  globalDiscountAmount?: number;
  notes?: string;
  terms?: string;
  internalNotes?: string;
}

// ==================== ACTION DTOs ====================

export interface RejectQuotationDto {
  reason?: string;
}

export interface ConvertQuotationDto {
  notes?: string;
}

export interface CancelQuotationDto {
  reason?: string;
}

// ==================== QUERY DTOs ====================

export interface QuotationQueryDto {
  page?: number;
  pageSize?: number;
  companyId?: string;
  customerId?: string;
  status?: QuotationStatus;
  search?: string;
}

// ==================== STATS DTOs ====================

export interface QuotationStatsDto {
  totalQuotations: number;
  totalAmount: number;
  quotationsByStatus: {
    DRAFT: number;
    SENT: number;
    ACCEPTED: number;
    REJECTED: number;
    CONVERTED: number;
    EXPIRED: number;
    CANCELLED: number;
  };
  acceptanceRate: number;
  conversionRate: number;
  averageQuotationAmount: number;
  totalAcceptedAmount: number;
  totalConvertedAmount: number;
}

// ==================== API RESPONSE WRAPPER ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResult<T> {
  result: T[];
  limit: number;
  offset: number;
  hasNext: boolean;
  timestamp: Date;
}

// ==================== CONSTANTES ====================

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  'DRAFT': 'Borrador',
  'SENT': 'Enviada',
  'ACCEPTED': 'Aceptada',
  'REJECTED': 'Rechazada',
  'CONVERTED': 'Convertida',
  'EXPIRED': 'Expirada',
  'CANCELLED': 'Cancelada'
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  'DRAFT': '#6b7280',
  'SENT': '#3b82f6',
  'ACCEPTED': '#10b981',
  'REJECTED': '#ef4444',
  'CONVERTED': '#8b5cf6',
  'EXPIRED': '#f59e0b',
  'CANCELLED': '#1f2937'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'CASH': 'Efectivo',
  'BANK_TRANSFER': 'Transferencia Bancaria',
  'CREDIT_CARD': 'Tarjeta de Crédito',
  'DEBIT_CARD': 'Tarjeta de Débito',
  'CHECK': 'Cheque',
  'DIGITAL_WALLET': 'Billetera Digital',
  'OTHER': 'Otro'
};

// ==================== UTILIDADES ====================

/**
 * Calcula el total de una línea de item
 */
export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  discountPercentage: number = 0,
  discountAmount: number = 0,
  taxRate: number = 19
): {
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  lineTotal: number;
} {
  const subtotal = quantity * unitPrice;

  // Calcular descuento
  const discount = discountPercentage > 0
    ? subtotal * (discountPercentage / 100)
    : discountAmount;

  const baseAmount = subtotal - discount;
  const tax = baseAmount * (taxRate / 100);
  const lineTotal = baseAmount + tax;

  return {
    subtotal,
    discountTotal: discount,
    taxAmount: tax,
    lineTotal
  };
}

/**
 * Calcula los totales de una cotización
 */
export function calculateQuotationTotals(
  items: CreateQuotationItemDto[],
  globalDiscountPercentage: number = 0,
  globalDiscountAmount: number = 0
): {
  subtotal: number;
  itemsDiscount: number;
  globalDiscount: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
} {
  let subtotal = 0;
  let itemsDiscount = 0;
  let taxTotal = 0;

  items.forEach(item => {
    const itemCalc = calculateItemTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercentage || 0,
      item.discountAmount || 0,
      item.taxRate || 19
    );

    subtotal += itemCalc.subtotal;
    itemsDiscount += itemCalc.discountTotal;
    taxTotal += itemCalc.taxAmount;
  });

  // Descuento global
  const globalDiscount = globalDiscountPercentage > 0
    ? subtotal * (globalDiscountPercentage / 100)
    : globalDiscountAmount;

  const discountTotal = itemsDiscount + globalDiscount;
  const total = subtotal - discountTotal + taxTotal;

  return {
    subtotal,
    itemsDiscount,
    globalDiscount,
    discountTotal,
    taxTotal,
    total
  };
}

/**
 * Calcula días hasta expiración
 */
export function calculateDaysUntilExpiry(validUntil: Date | string): number {
  const expiryDate = new Date(validUntil);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Determina si una cotización está expirada
 */
export function isQuotationExpired(validUntil: Date | string): boolean {
  return calculateDaysUntilExpiry(validUntil) <= 0;
}

/**
 * Obtiene el color para mostrar los días hasta expiración
 */
export function getExpiryColor(daysUntilExpiry: number, isExpired: boolean): string {
  if (isExpired) return '#ef4444'; // Rojo
  if (daysUntilExpiry <= 3) return '#f59e0b'; // Amarillo
  if (daysUntilExpiry <= 7) return '#3b82f6'; // Azul
  return '#10b981'; // Verde
}

/**
 * Verifica si una acción está permitida según el estado
 */
export function canPerformAction(
  status: QuotationStatus,
  action: 'edit' | 'delete' | 'send' | 'accept' | 'reject' | 'convert' | 'cancel'
): boolean {
  const permissions: Record<QuotationStatus, string[]> = {
    'DRAFT': ['edit', 'delete', 'send', 'cancel'],
    'SENT': ['accept', 'reject', 'cancel'],
    'ACCEPTED': ['convert', 'cancel'],
    'REJECTED': ['cancel'],
    'CONVERTED': [],
    'EXPIRED': ['cancel'],
    'CANCELLED': []
  };

  return permissions[status]?.includes(action) || false;
}
