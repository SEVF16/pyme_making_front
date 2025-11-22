// invoices.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import {
  InvoiceResponseDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceQueryDto,
  InvoiceStatsDto,
  InvoiceConfigDto,
  CreateInvoiceItemDto,
  UpdateInvoiceItemDto,
  PaymentMethod,
  PaymentTerm
} from '../../interfaces/invoice.interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService extends BaseApiService {
  private currentTenantId: string | null = null;

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    this.initializeTenantId();
  }

  // ===== MÉTODOS DE INICIALIZACIÓN =====

  private initializeTenantId(): void {
    if (this.isBrowser()) {
      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId) {
        this.setTenantId(tenantId);
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ===== MÉTODOS PARA MANEJAR TENANT-ID =====

  setTenantId(tenantId: string): void {
    this.currentTenantId = tenantId;
    this.headersService.setHeader('x-tenant-id', tenantId);

    if (this.isBrowser()) {
      localStorage.setItem('tenant_id', tenantId);
    }
  }

  getTenantId(): string | null {
    return this.currentTenantId;
  }

  clearTenantId(): void {
    this.currentTenantId = null;
    this.headersService.removeHeader('x-tenant-id');

    if (this.isBrowser()) {
      localStorage.removeItem('tenant_id');
    }
  }

  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

  // ===== MÉTODOS CRUD =====

  /**
   * Crear nueva factura
   */
  createInvoice(invoice: CreateInvoiceDto): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.post<ApiResponse<InvoiceResponseDto>>('invoices', invoice);
  }

  /**
   * Obtener facturas con paginación y filtros
   */
  getInvoices(params: InvoiceQueryDto): Observable<ApiPaginatedResponse<InvoiceResponseDto>> {
    this.ensureTenantId();

    const queryParams: any = { ...params };

    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 10;
    if (!queryParams.page) queryParams.page = 1;
    if (!queryParams.sortBy) queryParams.sortBy = 'createdAt';
    if (!queryParams.sortOrder) queryParams.sortOrder = 'DESC';

    return this.get<ApiPaginatedResponse<InvoiceResponseDto>>('invoices', queryParams);
  }

  /**
   * Obtener factura por ID
   */
  getInvoiceById(id: string): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto>>(`invoices/${id}`);
  }

  /**
   * Obtener factura por número
   */
  getInvoiceByNumber(invoiceNumber: string): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto>>(`invoices/number/${invoiceNumber}`);
  }

  /**
   * Buscar facturas
   */
  searchInvoices(query: string): Observable<ApiResponse<InvoiceResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto[]>>('invoices/search', { q: query });
  }

  /**
   * Obtener facturas por cliente
   */
  getInvoicesByCustomer(customerId: string): Observable<ApiResponse<InvoiceResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto[]>>(`invoices/customer/${customerId}`);
  }

  /**
   * Obtener estadísticas
   */
  getStats(): Observable<ApiResponse<InvoiceStatsDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceStatsDto>>('invoices/stats');
  }

  /**
   * Obtener facturas vencidas
   */
  getOverdueInvoices(): Observable<ApiResponse<InvoiceResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto[]>>('invoices/overdue');
  }

  /**
   * Obtener facturas en borrador
   */
  getDraftInvoices(): Observable<ApiResponse<InvoiceResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceResponseDto[]>>('invoices/drafts');
  }

  /**
   * Actualizar factura
   */
  updateInvoice(id: string, invoice: UpdateInvoiceDto): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.put<ApiResponse<InvoiceResponseDto>>(`invoices/${id}`, invoice);
  }

  /**
   * Recalcular totales de factura
   */
  recalculateTotals(id: string): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.put<ApiResponse<InvoiceResponseDto>>(`invoices/${id}/recalculate`, {});
  }

  /**
   * Eliminar factura
   */
  deleteInvoice(id: string): Observable<void> {
    this.ensureTenantId();
    return this.delete<void>(`invoices/${id}`);
  }

  // ===== MÉTODOS DE ÍTEMS =====

  /**
   * Agregar ítem a factura
   */
  addItem(invoiceId: string, item: CreateInvoiceItemDto): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.post<ApiResponse<InvoiceResponseDto>>(`invoices/${invoiceId}/items`, item);
  }

  /**
   * Actualizar ítem de factura
   */
  updateItem(
    invoiceId: string,
    itemId: string,
    item: UpdateInvoiceItemDto
  ): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.put<ApiResponse<InvoiceResponseDto>>(`invoices/${invoiceId}/items/${itemId}`, item);
  }

  /**
   * Eliminar ítem de factura
   */
  deleteItem(invoiceId: string, itemId: string): Observable<ApiResponse<InvoiceResponseDto>> {
    this.ensureTenantId();
    return this.delete<ApiResponse<InvoiceResponseDto>>(`invoices/${invoiceId}/items/${itemId}`);
  }

  // ===== MÉTODOS DE CONFIGURACIÓN =====

  /**
   * Obtener configuración del tenant
   */
  getConfig(): Observable<ApiResponse<InvoiceConfigDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<InvoiceConfigDto>>('invoices/config');
  }

  /**
   * Obtener métodos de pago habilitados
   */
  getPaymentMethods(): Observable<ApiResponse<PaymentMethod[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentMethod[]>>('invoices/config/payment-methods');
  }

  /**
   * Obtener términos de pago disponibles
   */
  getPaymentTerms(): Observable<ApiResponse<PaymentTerm[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentTerm[]>>('invoices/config/payment-terms');
  }

  // ===== MÉTODOS DE PDF =====

  /**
   * Descargar PDF de factura
   */
  downloadPDF(id: string): Observable<Blob> {
    this.ensureTenantId();

    // Para blob, necesitamos usar http directamente con responseType
    const headers = this.headersService.getHeaders();

    return this.http.get(`${this.baseUrl}/invoices/${id}/pdf`, {
      headers: headers as any,
      responseType: 'blob'
    });
  }
}
