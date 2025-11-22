// ticket-query-params.interface.ts
import { TicketStatus } from './ticket-status.enum';

export interface TicketQueryDto {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  status?: TicketStatus;
  companyId?: string;
  customerId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}
