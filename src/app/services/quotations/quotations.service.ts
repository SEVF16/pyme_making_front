// quotations.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';

import {
  QuotationResponseDto,
  CreateQuotationDto,
  UpdateQuotationDto,
  RejectQuotationDto,
  ConvertQuotationDto,
  CancelQuotationDto,
  QuotationQueryDto,
  QuotationStatsDto,
  PaginatedResult
} from '../../interfaces/quotation.interfaces';
import { HeadersService } from '../headers.service';

@Injectable({
  providedIn: 'root'
})
export class QuotationsService extends BaseApiService {
  private tenantId: string | null = null;

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    this.initializeTenantId();
  }

  /**
   * Inicializa el tenant-id desde localStorage (solo en browser)
   */
  private initializeTenantId(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.tenantId = localStorage.getItem('tenant_id');
    }
  }

  /**
   * Asegura que el tenant-id esté configurado antes de cada petición
   */
  private ensureTenantId(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentTenantId = localStorage.getItem('tenant_id');
      if (currentTenantId && currentTenantId !== this.tenantId) {
        this.tenantId = currentTenantId;
        this.headersService.setTenantId(currentTenantId);
      }
    }
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Crear una nueva cotización
   */
  createQuotation(quotation: CreateQuotationDto): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.post<QuotationResponseDto>('quotations', quotation);
  }

  /**
   * Obtener todas las cotizaciones con paginación y filtros
   */
  getQuotations(query?: QuotationQueryDto): Observable<PaginatedResult<QuotationResponseDto>> {
    this.ensureTenantId();
    const params = this.buildQueryParams(query);
    return this.get<PaginatedResult<QuotationResponseDto>>('quotations', params);
  }

  /**
   * Obtener una cotización por ID
   */
  getQuotationById(id: string): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.get<QuotationResponseDto>(`quotations/${id}`);
  }

  /**
   * Obtener cotizaciones por cliente
   */
  getQuotationsByCustomer(customerId: string, companyId: string): Observable<QuotationResponseDto[]> {
    this.ensureTenantId();
    return this.get<QuotationResponseDto[]>(`quotations/customer/${customerId}`, { companyId });
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  getStats(companyId: string, startDate?: string, endDate?: string): Observable<QuotationStatsDto> {
    this.ensureTenantId();
    const params: any = { companyId };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.get<QuotationStatsDto>('quotations/stats/summary', params);
  }

  /**
   * Actualizar una cotización (solo en estado DRAFT)
   */
  updateQuotation(id: string, quotation: UpdateQuotationDto): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.put<QuotationResponseDto>(`quotations/${id}`, quotation);
  }

  /**
   * Eliminar una cotización (solo en estado DRAFT)
   */
  deleteQuotation(id: string): Observable<void> {
    this.ensureTenantId();
    return this.delete<void>(`quotations/${id}`);
  }

  // ==================== WORKFLOW OPERATIONS ====================

  /**
   * Enviar cotización al cliente (DRAFT → SENT)
   */
  sendQuotation(id: string): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.patch<QuotationResponseDto>(`quotations/${id}/send`, {});
  }

  /**
   * Aceptar cotización (SENT → ACCEPTED)
   */
  acceptQuotation(id: string): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.patch<QuotationResponseDto>(`quotations/${id}/accept`, {});
  }

  /**
   * Rechazar cotización (SENT → REJECTED)
   */
  rejectQuotation(id: string, dto: RejectQuotationDto): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.patch<QuotationResponseDto>(`quotations/${id}/reject`, dto);
  }

  /**
   * Cancelar cotización
   */
  cancelQuotation(id: string, dto: CancelQuotationDto): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.patch<QuotationResponseDto>(`quotations/${id}/cancel`, dto);
  }

  /**
   * Convertir cotización a factura (ACCEPTED → CONVERTED)
   */
  convertToInvoice(id: string, dto?: ConvertQuotationDto): Observable<QuotationResponseDto> {
    this.ensureTenantId();
    return this.post<QuotationResponseDto>(`quotations/${id}/convert-to-invoice`, dto || {});
  }

  // ==================== UTILITIES ====================

  /**
   * Construye los parámetros de query desde el DTO
   */
  private buildQueryParams(query?: QuotationQueryDto): any {
    if (!query) return {};

    const params: any = {};

    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.companyId) params['companyId'] = query.companyId;
    if (query.customerId) params['customerId'] = query.customerId;
    if (query.status) params['status'] = query.status;
    if (query.search) params['search'] = query.search;

    return params;
  }
}
