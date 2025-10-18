export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
      sortField?: string;
    sortDirection?: string;
  sortOrder?: 'ASC' | 'DESC';
}