// subscription.interface.ts
import { Plan } from './plan.interface';
import { UsageMetric } from './usage-metric.interface';

export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'expired'
  | 'suspended'
  | 'cancelled';

export type BillingCycle = 'monthly' | 'yearly' | null;

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  billingCycle: BillingCycle;
  lastBillingDate: string | null;
  nextBillingDate: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
  usageMetrics?: UsageMetric[];
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
  daysRemaining: number;
}
