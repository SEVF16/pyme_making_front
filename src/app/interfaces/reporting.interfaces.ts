// reporting.interfaces.ts
// Interfaces y tipos para el módulo de Reportes (Reporting)

export enum ReportPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM'
}

export enum ReportFormat {
  JSON = 'JSON',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV'
}

export type AgingCategory = 'CURRENT' | '1-30' | '31-60' | '61-90' | '90+';

// ==================== REQUEST DTOs ====================

export interface ReportRequestDto {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  format?: ReportFormat;
}

export interface TopProductsRequestDto extends ReportRequestDto {
  limit?: number;
}

// ==================== RESPONSE DTOs ====================

export interface ExecutiveDashboardDto {
  sales: {
    total: number;
    count: number;
    average: number;
    trend: number;
  };
  purchases: {
    total: number;
    count: number;
    average: number;
    trend: number;
  };
  accountsReceivable: {
    total: number;
    overdue: number;
    current: number;
    overduePercentage: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface SalesByPeriodItemDto {
  date: string;
  totalSales: number;
  invoiceCount: number;
  averageTicket: number;
  taxTotal: number;
  netTotal: number;
}

export interface SalesByPeriodDto {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalInvoices: number;
    averageTicket: number;
    totalTax: number;
    totalNet: number;
  };
  data: SalesByPeriodItemDto[];
  generatedAt: string;
}

export interface TopProductItemDto {
  rank: number;
  productId: string;
  productName: string;
  productCode: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  invoiceCount: number;
}

export interface TopProductsDto {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalProducts: number;
    totalQuantitySold: number;
    totalRevenue: number;
  };
  products: TopProductItemDto[];
  generatedAt: string;
}

export interface StatementTransactionDto {
  date: string;
  documentType: string;
  documentNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerStatementDto {
  customer: {
    id: string;
    name: string;
    rut: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  balances: {
    opening: number;
    closing: number;
    totalDebits: number;
    totalCredits: number;
  };
  transactions: StatementTransactionDto[];
  generatedAt: string;
}

export interface OverdueReceivableItemDto {
  invoiceId: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    rut: string;
  };
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  daysOverdue: number;
  agingCategory: AgingCategory;
}

export interface OverdueReceivablesDto {
  summary: {
    totalOverdue: number;
    totalInvoices: number;
    totalBalanceDue: number;
  };
  aging: {
    current: { count: number; amount: number };
    days1to30: { count: number; amount: number };
    days31to60: { count: number; amount: number };
    days61to90: { count: number; amount: number };
    days90plus: { count: number; amount: number };
  };
  receivables: OverdueReceivableItemDto[];
  generatedAt: string;
}

export interface InventoryItemDto {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  minimumStock: number;
  needsRestock: boolean;
}

export interface ValuedInventoryDto {
  summary: {
    totalProducts: number;
    totalValue: number;
    totalItemsInStock: number;
    productsNeedingRestock: number;
  };
  byCategory: {
    category: string;
    productCount: number;
    totalValue: number;
  }[];
  items: InventoryItemDto[];
  generatedAt: string;
}

export interface PosCashSummaryDto {
  period: {
    startDate: string;
    endDate: string;
  };
  cash: {
    opening: number;
    closing: number;
    expected: number;
    actual: number;
    difference: number;
  };
  sales: {
    total: number;
    cash: number;
    card: number;
    other: number;
    transactionCount: number;
  };
  expenses: {
    total: number;
  };
  generatedAt: string;
}

// ==================== CONSTANTES ====================

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  'TODAY': 'Hoy',
  'YESTERDAY': 'Ayer',
  'THIS_WEEK': 'Esta Semana',
  'LAST_WEEK': 'Semana Pasada',
  'THIS_MONTH': 'Este Mes',
  'LAST_MONTH': 'Mes Pasado',
  'THIS_QUARTER': 'Este Trimestre',
  'LAST_QUARTER': 'Trimestre Pasado',
  'THIS_YEAR': 'Este Año',
  'LAST_YEAR': 'Año Pasado',
  'CUSTOM': 'Personalizado'
};

export const AGING_CATEGORY_LABELS: Record<AgingCategory, string> = {
  'CURRENT': 'Al día',
  '1-30': '1-30 días',
  '31-60': '31-60 días',
  '61-90': '61-90 días',
  '90+': 'Más de 90 días'
};

export const AGING_CATEGORY_COLORS: Record<AgingCategory, string> = {
  'CURRENT': '#10b981',
  '1-30': '#3b82f6',
  '31-60': '#f59e0b',
  '61-90': '#ef4444',
  '90+': '#991b1b'
};

// ==================== UTILIDADES ====================

/**
 * Obtiene el color para una categoría de aging
 */
export function getAgingColor(category: AgingCategory): string {
  return AGING_CATEGORY_COLORS[category] || '#6b7280';
}

/**
 * Obtiene la clase CSS para un trend (positivo o negativo)
 */
export function getTrendClass(trend: number): string {
  return trend >= 0 ? 'trend-positive' : 'trend-negative';
}

/**
 * Formatea un porcentaje con signo
 */
export function formatTrend(trend: number): string {
  const sign = trend >= 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

/**
 * Calcula el porcentaje de una parte sobre el total
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Obtiene el color para el indicador de tendencia
 */
export function getTrendColor(trend: number): string {
  if (trend > 0) return '#10b981'; // Verde
  if (trend < 0) return '#ef4444'; // Rojo
  return '#6b7280'; // Gris
}

/**
 * Obtiene el ícono para el indicador de tendencia
 */
export function getTrendIcon(trend: number): 'trending_up' | 'trending_down' | 'trending_flat' {
  if (trend > 0) return 'trending_up';
  if (trend < 0) return 'trending_down';
  return 'trending_flat';
}
