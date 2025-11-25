// plan.interface.ts

export interface PlanLimits {
  maxUsers: number;
  maxInvoicesPerMonth: number;
  maxStorageGB: number;
  maxApiCallsPerDay: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  tier: number;
  priceMonthly: string;
  priceYearly: string;
  currency: string;
  limits: PlanLimits;
  features: string[];
  isActive: boolean;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  tier: number;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  limits: PlanLimits;
  features: string[];
  isActive?: boolean;
  isCustom?: boolean;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}
