// usage-metric.interface.ts

export interface UsageMetric {
  id: string;
  subscriptionId: string;
  period: string;
  activeUsers: number;
  invoicesCreated: number;
  storageUsedGB: string;
  apiCallsCount: number;
  quotationsCreated: number;
  purchaseOrdersCreated: number;
  productsCreated: number;
  customersCreated: number;
  additionalMetrics: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageSummary {
  activeUsers: number;
  maxUsers: number;
  invoicesThisMonth: number;
  maxInvoices: number;
  storageUsedGB: number;
  maxStorageGB: number;
}
