// company.interface.ts
import { SubscriptionWithPlan } from './subscription.interface';
import { UsageSummary } from './usage-metric.interface';

export type CompanyStatus = 'active' | 'inactive' | 'suspended';
export type CompanySize = 'micro' | 'small' | 'medium' | 'large';

export interface Company {
  id: string;
  businessName: string;
  rut: string;
  email: string;
  fantasyName: string;
  companySize: CompanySize;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListItem extends Company {
  subscription: SubscriptionWithPlan | null;
  usage: UsageSummary | null;
}

export interface CreateCompanyWithPlanDto {
  businessName: string;
  rut: string;
  email: string;
  fantasyName?: string;
  companySize?: CompanySize;
  planId: string;
  subscriptionDays?: number;
  initialAdmin: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

export interface UpdateCompanyStatusDto {
  status: CompanyStatus;
  reason?: string;
}

export interface AssignPlanDto {
  planId: string;
  applyImmediately?: boolean;
}

export interface ExtendSubscriptionDto {
  days: number;
}
