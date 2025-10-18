import { PaginationParams } from "../pagination-query-params.interfaces";

export interface CustomerQueryDto extends PaginationParams {
    companyId?: string;
    status?: string;

    customerType?: string;
    search?: string; // Campo común para búsqueda general
}