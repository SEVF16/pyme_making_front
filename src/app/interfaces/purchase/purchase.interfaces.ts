/**
 * Tipo de metodo de pago disponible en el sistema
 */
export type PaymentMethodType = 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'check' | 'other';

/**
 * Estado de la compra
 */
export type PurchaseStatus = 'draft' | 'pending' | 'completed' | 'cancelled';

/**
 * Interface para el metodo de pago
 */
export interface PaymentMethod {
  id?: string;
  type: PaymentMethodType;
  name: string;
  description?: string;
  isActive: boolean;
}

/**
 * Interface para el item de producto en la compra
 */
export interface PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
}

/**
 * Interface principal para la compra
 */
export interface Purchase {
  id?: string;
  purchaseNumber?: string;
  supplierId?: string;
  supplierName?: string;
  items: PurchaseItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  status: PurchaseStatus;
  notes?: string;
  companyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO para crear una nueva compra
 */
export interface CreatePurchaseDto {
  supplierId?: string;
  items: PurchaseItem[];
  paymentMethodId?: string;
  notes?: string;
  companyId: string;
}

/**
 * DTO para actualizar una compra existente
 */
export interface UpdatePurchaseDto extends Partial<CreatePurchaseDto> {
  id: string;
  status?: PurchaseStatus;
}

/**
 * Parametros de consulta para compras
 */
export interface PurchaseQueryParams {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  companyId?: string;
  status?: PurchaseStatus;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethodId?: string;
  minTotal?: number;
  maxTotal?: number;
}

/**
 * Respuesta paginada de compras
 */
export interface PaginatedPurchasesResponse {
  data: Purchase[];
  hasNext: boolean;
  offset: number;
  limit: number;
  timestamp: string;
}

/**
 * Evento de cambio de compra
 */
export interface PurchaseChangeEvent {
  purchase: Purchase;
  isValid: boolean;
}
