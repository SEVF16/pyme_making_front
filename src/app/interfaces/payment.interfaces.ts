// payment.interfaces.ts - Interfaces para el módulo de Pagos

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentType = 'INBOUND' | 'OUTBOUND';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'DIGITAL_WALLET' | 'OTHER';

// ===== RESPONSE DTOS =====

export interface PaymentResponseDto {
  // Identificación
  id: string;
  companyId: string;
  paymentNumber: string;

  // Tipo y Estado
  type: PaymentType;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Relaciones con Documentos
  invoiceId?: string;
  purchaseOrderId?: string;
  businessPartnerId?: string;

  // Montos y Moneda
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInBaseCurrency?: number;

  // Fechas
  paymentDate: Date;
  processedAt?: Date;
  cancelledAt?: Date;

  // Información de Transacción
  transactionReference?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  cardDetails?: {
    last4Digits?: string;
    cardType?: string;
    cardHolderName?: string;
  };

  // Snapshot de Partner
  partnerData?: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
  };

  // Notas y Referencias
  notes?: string;
  internalNotes?: string;
  processedBy?: string;

  // Estados Calculados
  isCompleted: boolean;
  isPending: boolean;
  canBeCancelled: boolean;
  canBeRefunded: boolean;

  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

// ===== CREATE DTOS =====

export interface CreatePaymentDto {
  companyId: string;
  type: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: string;
  invoiceId?: string;
  purchaseOrderId?: string;
  currency?: string;
  exchangeRate?: number;
  paymentNumber?: string;
  businessPartnerId?: string;
  transactionReference?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  cardDetails?: {
    last4Digits?: string;
    cardType?: string;
    cardHolderName?: string;
  };
  partnerData?: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  internalNotes?: string;
}

// ===== UPDATE DTOS =====

export interface UpdatePaymentDto {
  paymentMethod?: PaymentMethod;
  invoiceId?: string;
  purchaseOrderId?: string;
  businessPartnerId?: string;
  amount?: number;
  currency?: string;
  exchangeRate?: number;
  paymentDate?: string;
  paymentNumber?: string;
  transactionReference?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  cardDetails?: {
    last4Digits?: string;
    cardType?: string;
    cardHolderName?: string;
  };
  partnerData?: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  internalNotes?: string;
}

// ===== QUERY DTOS =====

export interface PaymentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: PaymentType;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  invoiceId?: string;
  purchaseOrderId?: string;
  businessPartnerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'paymentDate' | 'paymentNumber' | 'amount' | 'status' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

// ===== ACTION DTOS =====

export interface ProcessPaymentDto {
  processedBy?: string;
  notes?: string;
}

export interface RefundPaymentDto {
  reason?: string;
  processedBy?: string;
}

export interface CancelPaymentDto {
  reason?: string;
}

export interface MarkFailedPaymentDto {
  reason?: string;
}

// ===== STATS DTOS =====

export interface PaymentStatsDto {
  totalPayments: number;
  totalInbound: number;
  totalOutbound: number;
  totalAmount: number;
  inboundAmount: number;
  outboundAmount: number;
  paymentsByStatus: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
    CANCELLED: number;
    REFUNDED: number;
  };
  paymentsByType: {
    INBOUND: number;
    OUTBOUND: number;
  };
  completedPaymentsAmount: number;
  pendingPaymentsAmount: number;
  averagePaymentAmount: number;
}

export interface PaymentsByMethodDto {
  byMethod: {
    [key in PaymentMethod]: {
      count: number;
      totalAmount: number;
    };
  };
}

// ===== CONSTANTES Y MAPEOS =====

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  'PENDING': 'Pendiente',
  'PROCESSING': 'Procesando',
  'COMPLETED': 'Completado',
  'FAILED': 'Fallido',
  'CANCELLED': 'Cancelado',
  'REFUNDED': 'Reembolsado'
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  'INBOUND': 'Pago Recibido',
  'OUTBOUND': 'Pago Realizado'
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

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  'PENDING': '#f59e0b',
  'PROCESSING': '#3b82f6',
  'COMPLETED': '#10b981',
  'FAILED': '#ef4444',
  'CANCELLED': '#6b7280',
  'REFUNDED': '#8b5cf6'
};
