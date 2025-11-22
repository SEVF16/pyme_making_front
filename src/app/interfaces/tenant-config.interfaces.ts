// ============================================
// Tenant Config Module Interfaces
// ============================================

// ============================================
// ENUMS
// ============================================

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  DEBIT_CARD = 'debit_card',
  CREDIT_CARD = 'credit_card',
  CHECK = 'check',
  OTHER = 'other'
}

export enum PaymentTerm {
  IMMEDIATE = 'immediate',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90'
}

export enum InvoiceType {
  SALE = 'sale',
  BOLETA = 'boleta',
  PURCHASE = 'purchase',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  PROFORMA = 'proforma'
}

export enum TaxCalculationMode {
  INCLUDED = 'included',
  EXCLUDED = 'excluded'
}

export enum PriceRoundingRule {
  EXACT = 'exact',
  TO_990 = '990',
  TO_000 = '000'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  BUNDLE = 'BUNDLE'
}

export enum PromotionType {
  SEASONAL = 'SEASONAL',
  CLEARANCE = 'CLEARANCE',
  HOLIDAY = 'HOLIDAY',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  LOYALTY = 'LOYALTY'
}

export enum DiscountApplicationLevel {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  ORDER = 'ORDER',
  CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT'
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface TaxConfigResponseDto {
  ivaRate: number;
  ivaEnabled: boolean;
  calculationMode: TaxCalculationMode;
  siiEnabled: boolean;
  siiEnvironment?: string | null;
  enabledInvoiceTypes: InvoiceType[];
}

export interface SalesConfigResponseDto {
  paymentMethods: PaymentMethod[];
  paymentTerms: PaymentTerm[];
  defaultPaymentTerm: PaymentTerm;
  invoiceSeriesPrefix: string;
  currentFolio: number;
  requireCustomer: boolean;
}

export interface InventoryConfigResponseDto {
  stockControlEnabled: boolean;
  allowNegativeStock: boolean;
  lowStockAlertsEnabled: boolean;
  defaultMinStock: number;
  priceRoundingRule: PriceRoundingRule;
  defaultCategories: string[];
  defaultUnit: string;
}

export interface GeneralConfigResponseDto {
  currency: string;
  timezone: string;
  dateFormat: string;
  locale: string;
}

export interface DiscountsConfigResponseDto {
  discountsEnabled: boolean;
  allowedDiscountTypes: DiscountType[];
  allowedDiscountLevels: DiscountApplicationLevel[];
  maxDiscountPercentage: number;
  allowDiscountStacking: boolean;
  promotionsEnabled: boolean;
  allowedPromotionTypes: PromotionType[];
  maxActivePromotions: number;
}

export interface TenantConfigResponseDto {
  id: string;
  companyId: string;
  tax: TaxConfigResponseDto;
  sales: SalesConfigResponseDto;
  inventory: InventoryConfigResponseDto;
  general: GeneralConfigResponseDto;
  discounts?: DiscountsConfigResponseDto;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateTenantConfigDto {
  companyId: string;

  // Tax Configuration
  ivaRate?: number;
  ivaEnabled?: boolean;
  taxCalculationMode?: TaxCalculationMode;
  siiEnabled?: boolean;
  siiEnvironment?: string;
  enabledInvoiceTypes?: InvoiceType[];

  // Sales Configuration
  enabledPaymentMethods?: PaymentMethod[];
  availablePaymentTerms?: PaymentTerm[];
  defaultPaymentTerm?: PaymentTerm;
  invoiceSeriesPrefix?: string;
  invoiceFolioSeed?: number;
  requireCustomerForInvoice?: boolean;

  // Inventory Configuration
  stockControlEnabled?: boolean;
  allowNegativeStock?: boolean;
  lowStockAlertsEnabled?: boolean;
  defaultMinStock?: number;
  priceRoundingRule?: PriceRoundingRule;
  defaultProductCategories?: string[];
  defaultProductUnit?: string;

  // General Configuration
  baseCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  locale?: string;

  // Discounts Configuration
  discountsEnabled?: boolean;
  allowedDiscountTypes?: DiscountType[];
  allowedDiscountLevels?: DiscountApplicationLevel[];
  maxDiscountPercentage?: number;
  allowDiscountStacking?: boolean;
  promotionsEnabled?: boolean;
  allowedPromotionTypes?: PromotionType[];
  maxActivePromotions?: number;
}

export interface UpdateTenantConfigDto {
  // Tax Configuration
  ivaRate?: number;
  ivaEnabled?: boolean;
  taxCalculationMode?: TaxCalculationMode;
  siiEnabled?: boolean;
  siiEnvironment?: string;
  enabledInvoiceTypes?: InvoiceType[];

  // Sales Configuration
  enabledPaymentMethods?: PaymentMethod[];
  availablePaymentTerms?: PaymentTerm[];
  defaultPaymentTerm?: PaymentTerm;
  invoiceSeriesPrefix?: string;
  requireCustomerForInvoice?: boolean;

  // Inventory Configuration
  stockControlEnabled?: boolean;
  allowNegativeStock?: boolean;
  lowStockAlertsEnabled?: boolean;
  defaultMinStock?: number;
  priceRoundingRule?: PriceRoundingRule;
  defaultProductCategories?: string[];
  defaultProductUnit?: string;

  // General Configuration
  baseCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  locale?: string;

  // Discounts Configuration
  discountsEnabled?: boolean;
  allowedDiscountTypes?: DiscountType[];
  allowedDiscountLevels?: DiscountApplicationLevel[];
  maxDiscountPercentage?: number;
  allowDiscountStacking?: boolean;
  promotionsEnabled?: boolean;
  allowedPromotionTypes?: PromotionType[];
  maxActivePromotions?: number;
}

// ============================================
// UTILITY DTOs
// ============================================

export interface TaxCalculationRequestDto {
  amount: number;
}

export interface TaxCalculationResponseDto {
  amount: number;
  tax: number;
  total: number;
}

export interface PriceRoundingRequestDto {
  price: number;
}

export interface PriceRoundingResponseDto {
  originalPrice: number;
  roundedPrice: number;
}

export interface NextInvoiceNumberResponseDto {
  invoiceNumber: string;
}

// ============================================
// LABELS AND COLORS
// ============================================

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.TRANSFER]: 'Transferencia',
  [PaymentMethod.DEBIT_CARD]: 'Tarjeta de Débito',
  [PaymentMethod.CREDIT_CARD]: 'Tarjeta de Crédito',
  [PaymentMethod.CHECK]: 'Cheque',
  [PaymentMethod.OTHER]: 'Otro'
};

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: 'Contado',
  [PaymentTerm.NET_30]: '30 días',
  [PaymentTerm.NET_60]: '60 días',
  [PaymentTerm.NET_90]: '90 días'
};

export const PAYMENT_TERM_DAYS: Record<PaymentTerm, number> = {
  [PaymentTerm.IMMEDIATE]: 0,
  [PaymentTerm.NET_30]: 30,
  [PaymentTerm.NET_60]: 60,
  [PaymentTerm.NET_90]: 90
};

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  [InvoiceType.SALE]: 'Factura de Venta',
  [InvoiceType.BOLETA]: 'Boleta de Venta',
  [InvoiceType.PURCHASE]: 'Factura de Compra',
  [InvoiceType.CREDIT_NOTE]: 'Nota de Crédito',
  [InvoiceType.DEBIT_NOTE]: 'Nota de Débito',
  [InvoiceType.PROFORMA]: 'Factura Proforma'
};

export const TAX_MODE_LABELS: Record<TaxCalculationMode, string> = {
  [TaxCalculationMode.INCLUDED]: 'IVA Incluido',
  [TaxCalculationMode.EXCLUDED]: 'IVA Excluido'
};

export const ROUNDING_RULE_LABELS: Record<PriceRoundingRule, string> = {
  [PriceRoundingRule.EXACT]: 'Precio Exacto',
  [PriceRoundingRule.TO_990]: 'Redondeo a .990',
  [PriceRoundingRule.TO_000]: 'Redondeo a .000'
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'Porcentual',
  [DiscountType.FIXED_AMOUNT]: 'Monto Fijo',
  [DiscountType.BUY_X_GET_Y]: 'Compra X Lleva Y',
  [DiscountType.BUNDLE]: 'Paquete'
};

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  [PromotionType.SEASONAL]: 'Temporada',
  [PromotionType.CLEARANCE]: 'Liquidación',
  [PromotionType.HOLIDAY]: 'Festividad',
  [PromotionType.SPECIAL_EVENT]: 'Evento Especial',
  [PromotionType.LOYALTY]: 'Lealtad'
};

export const DISCOUNT_LEVEL_LABELS: Record<DiscountApplicationLevel, string> = {
  [DiscountApplicationLevel.PRODUCT]: 'Producto',
  [DiscountApplicationLevel.CATEGORY]: 'Categoría',
  [DiscountApplicationLevel.ORDER]: 'Orden',
  [DiscountApplicationLevel.CUSTOMER_SEGMENT]: 'Segmento de Cliente'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calcula el IVA según el modo de cálculo y la tasa configurada
 */
export function calculateTax(
  amount: number,
  taxRate: number,
  mode: TaxCalculationMode,
  enabled: boolean
): { net: number; tax: number; total: number } {
  if (!enabled) {
    return { net: amount, tax: 0, total: amount };
  }

  const rate = taxRate / 100;

  if (mode === TaxCalculationMode.INCLUDED) {
    // El precio ya incluye IVA
    const net = amount / (1 + rate);
    const tax = amount - net;
    return { net, tax, total: amount };
  } else {
    // El precio es neto, calcular IVA
    const tax = amount * rate;
    const total = amount + tax;
    return { net: amount, tax, total };
  }
}

/**
 * Aplica regla de redondeo de precio
 */
export function applyPriceRounding(price: number, rule: PriceRoundingRule): number {
  switch (rule) {
    case PriceRoundingRule.EXACT:
      return Math.round(price);
    case PriceRoundingRule.TO_990:
      return Math.round(price / 1000) * 1000 - 10;
    case PriceRoundingRule.TO_000:
      return Math.round(price / 1000) * 1000;
    default:
      return price;
  }
}

/**
 * Calcula precio final con IVA y redondeo
 */
export function calculateFinalPrice(
  basePrice: number,
  config: TenantConfigResponseDto
): {
  net: number;
  tax: number;
  total: number;
  roundedTotal: number;
} {
  const { net, tax, total } = calculateTax(
    basePrice,
    config.tax.ivaRate,
    config.tax.calculationMode,
    config.tax.ivaEnabled
  );

  const roundedTotal = applyPriceRounding(total, config.inventory.priceRoundingRule);

  return { net, tax, total, roundedTotal };
}

/**
 * Valida si un método de pago está habilitado
 */
export function isPaymentMethodEnabled(
  method: PaymentMethod,
  config: TenantConfigResponseDto
): boolean {
  return config.sales.paymentMethods.includes(method);
}

/**
 * Valida si un término de pago está disponible
 */
export function isPaymentTermAvailable(
  term: PaymentTerm,
  config: TenantConfigResponseDto
): boolean {
  return config.sales.paymentTerms.includes(term);
}

/**
 * Valida si un tipo de factura está habilitado
 */
export function isInvoiceTypeEnabled(
  type: InvoiceType,
  config: TenantConfigResponseDto
): boolean {
  return config.tax.enabledInvoiceTypes.includes(type);
}

/**
 * Valida si se puede vender con stock negativo
 */
export function canSellWithNegativeStock(config: TenantConfigResponseDto): boolean {
  return config.inventory.stockControlEnabled && config.inventory.allowNegativeStock;
}

/**
 * Valida si el control de stock está habilitado
 */
export function isStockControlEnabled(config: TenantConfigResponseDto): boolean {
  return config.inventory.stockControlEnabled;
}

/**
 * Valida si el SII está habilitado
 */
export function isSiiEnabled(config: TenantConfigResponseDto): boolean {
  return config.tax.siiEnabled;
}

/**
 * Obtiene los días del término de pago
 */
export function getPaymentTermDays(term: PaymentTerm): number {
  return PAYMENT_TERM_DAYS[term] || 0;
}

/**
 * Formatea el número de factura con el prefijo
 */
export function formatInvoiceNumber(prefix: string, folio: number): string {
  return `${prefix}-${folio.toString().padStart(8, '0')}`;
}

/**
 * Valida si la configuración está activa
 */
export function isConfigActive(config: TenantConfigResponseDto): boolean {
  return config.isActive;
}
