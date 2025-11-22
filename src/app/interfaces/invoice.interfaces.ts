// invoice.interfaces.ts - Interfaces para el módulo de Facturas

export type InvoiceType = 'sale' | 'boleta' | 'purchase' | 'credit_note' | 'debit_note' | 'proforma';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'check' | 'other';
export type PaymentTerm = 'immediate' | 'net_30' | 'net_60' | 'net_90';

// ===== RESPONSE DTOS =====

export interface InvoiceResponseDto {
  // Identificación
  id: string;
  companyId: string;
  customerId?: string;
  invoiceNumber: string;

  // Tipo y Estado
  type: InvoiceType;
  status: InvoiceStatus;

  // Fechas
  issueDate: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Datos del Cliente
  customerData?: CustomerData;

  // Moneda
  currency: string;
  exchangeRate: number;

  // Términos y Notas
  terms?: string;
  notes?: string;

  // Pago
  paymentMethod?: PaymentMethod;

  // Descuentos Globales
  globalDiscountPercentage: number;
  globalDiscountAmount: number;

  // Totales (calculados automáticamente)
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;

  // Ítems
  items: InvoiceItemResponseDto[];
  itemCount: number;

  // Estado de Vencimiento
  isOverdue: boolean;
  daysPastDue: number;

  // Adicional
  additionalInfo?: Record<string, any>;
}

export interface InvoiceItemResponseDto {
  id: string;
  productId?: string;
  productSku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  total: number;
  unit?: string;
  additionalInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CREATE DTOS =====

export interface CreateInvoiceDto {
  companyId: string;
  customerId?: string;
  type: InvoiceType;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  customerData?: CustomerData;
  currency?: string;
  exchangeRate?: number;
  terms?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  globalDiscountPercentage?: number;
  globalDiscountAmount?: number;
  items: CreateInvoiceItemDto[];
  additionalInfo?: Record<string, any>;
}

export interface CreateInvoiceItemDto {
  productId?: string;
  productSku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  unit?: string;
  additionalInfo?: Record<string, any>;
}

// ===== UPDATE DTOS =====

export interface UpdateInvoiceDto {
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  customerData?: CustomerData;
  terms?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  globalDiscountPercentage?: number;
  globalDiscountAmount?: number;
  additionalInfo?: Record<string, any>;
}

export interface UpdateInvoiceItemDto {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  unit?: string;
  additionalInfo?: Record<string, any>;
}

// ===== QUERY DTOS =====

export interface InvoiceQueryDto {
  // Paginación
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Filtros
  companyId?: string;
  customerId?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  currency?: string;
  overdue?: boolean;
  paymentMethod?: PaymentMethod;
}

// ===== OTROS DTOS =====

export interface CustomerData {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceStatsDto {
  totalInvoices: number;
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  averageInvoiceAmount: number;
}

export interface InvoiceConfigDto {
  companyId: string;
  defaultPaymentMethod: PaymentMethod;
  enabledPaymentMethods: PaymentMethod[];
  defaultPaymentTerm: PaymentTerm;
  availablePaymentTerms: PaymentTerm[];
  invoicePrefix: string;
  boletaPrefix: string;
  defaultCurrency: string;
  taxRate: number;
  requiresApproval: boolean;
}

// ===== CONSTANTES Y MAPEOS =====

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  'sale': 'Factura de Venta',
  'boleta': 'Boleta de Venta',
  'purchase': 'Factura de Compra',
  'credit_note': 'Nota de Crédito',
  'debit_note': 'Nota de Débito',
  'proforma': 'Factura Proforma'
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  'draft': 'Borrador',
  'sent': 'Enviada',
  'paid': 'Pagada',
  'overdue': 'Vencida',
  'cancelled': 'Cancelada',
  'refunded': 'Reembolsada'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'cash': 'Efectivo',
  'transfer': 'Transferencia',
  'credit_card': 'Tarjeta de Crédito',
  'debit_card': 'Tarjeta de Débito',
  'check': 'Cheque',
  'other': 'Otro'
};

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  'immediate': 'Pago Inmediato',
  'net_30': 'Pago a 30 días',
  'net_60': 'Pago a 60 días',
  'net_90': 'Pago a 90 días'
};

export const PAYMENT_TERM_DAYS: Record<PaymentTerm, number> = {
  'immediate': 0,
  'net_30': 30,
  'net_60': 60,
  'net_90': 90
};
