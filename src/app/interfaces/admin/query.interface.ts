// query.interface.ts
import { CompanyStatus } from './company.interface';

export interface FilterCompaniesDto {
  status?: CompanyStatus;
  planId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
