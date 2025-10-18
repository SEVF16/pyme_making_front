import { PaginationParams } from "../pagination-query-params.interfaces";

export interface IUserQuery extends PaginationParams{

  companyId?: string;
  role?: 'admin' | 'manager' | 'employee' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}