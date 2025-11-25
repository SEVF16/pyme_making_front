// dashboard.interface.ts
import { Company } from './company.interface';
import { SubscriptionWithPlan } from './subscription.interface';
import { UsageMetric } from './usage-metric.interface';

export interface UserPublic {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super-admin' | 'admin' | 'manager' | 'employee' | 'viewer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLoginAt: string | null;
}

export interface CompanyDashboard {
  company: Company;
  subscription: SubscriptionWithPlan | null;
  users: UserPublic[];
  usage: UsageMetric | null;
  alerts: string[];
}

export interface MetricsOverview {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  trialCompanies: number;
  byPlan: Record<string, number>;
}
