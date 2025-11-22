// payments.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import {
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  CancelPaymentDto,
  MarkFailedPaymentDto,
  PaymentStatsDto,
  PaymentsByMethodDto
} from '../../interfaces/payment.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService extends BaseApiService {
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
   * Crear nuevo pago
   */
  createPayment(payment: CreatePaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.post<ApiResponse<PaymentResponseDto>>('payments', payment);
  }

  /**
   * Obtener pagos con paginación y filtros
   */
  getPayments(params: PaymentQueryDto): Observable<ApiPaginatedResponse<PaymentResponseDto>> {
    this.ensureTenantId();

    const queryParams: any = { ...params };

    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 10;
    if (!queryParams.page) queryParams.page = 1;
    if (!queryParams.sortBy) queryParams.sortBy = 'paymentDate';
    if (!queryParams.sortOrder) queryParams.sortOrder = 'DESC';

    return this.get<ApiPaginatedResponse<PaymentResponseDto>>('payments', queryParams);
  }

  /**
   * Obtener pago por ID
   */
  getPaymentById(id: string): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentResponseDto>>(`payments/${id}`);
  }

  /**
   * Actualizar pago (solo en PENDING)
   */
  updatePayment(id: string, payment: UpdatePaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.put<ApiResponse<PaymentResponseDto>>(`payments/${id}`, payment);
  }

  /**
   * Eliminar pago (solo en PENDING o FAILED)
   */
  deletePayment(id: string): Observable<void> {
    this.ensureTenantId();
    return this.delete<void>(`payments/${id}`);
  }

  // ===== MÉTODOS DE WORKFLOW =====

  /**
   * Procesar/completar pago
   */
  processPayment(id: string, dto: ProcessPaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PaymentResponseDto>>(`payments/${id}/process`, dto);
  }

  /**
   * Reembolsar pago
   */
  refundPayment(id: string, dto: RefundPaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PaymentResponseDto>>(`payments/${id}/refund`, dto);
  }

  /**
   * Cancelar pago
   */
  cancelPayment(id: string, dto: CancelPaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PaymentResponseDto>>(`payments/${id}/cancel`, dto);
  }

  /**
   * Marcar pago como fallido
   */
  markPaymentAsFailed(id: string, dto: MarkFailedPaymentDto): Observable<ApiResponse<PaymentResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PaymentResponseDto>>(`payments/${id}/mark-failed`, dto);
  }

  // ===== MÉTODOS DE CONSULTA =====

  /**
   * Obtener estadísticas
   */
  getStats(): Observable<ApiResponse<PaymentStatsDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentStatsDto>>('payments/stats/summary');
  }

  /**
   * Obtener pagos por método
   */
  getPaymentsByMethod(): Observable<ApiResponse<PaymentsByMethodDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentsByMethodDto>>('payments/stats/by-method');
  }

  /**
   * Obtener pagos pendientes
   */
  getPendingPayments(): Observable<ApiResponse<PaymentResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentResponseDto[]>>('payments/pending/list');
  }

  /**
   * Obtener pagos por factura
   */
  getPaymentsByInvoice(invoiceId: string): Observable<ApiResponse<PaymentResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentResponseDto[]>>(`payments/invoice/${invoiceId}`);
  }

  /**
   * Obtener pagos por orden de compra
   */
  getPaymentsByPurchaseOrder(purchaseOrderId: string): Observable<ApiResponse<PaymentResponseDto[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PaymentResponseDto[]>>(`payments/purchase-order/${purchaseOrderId}`);
  }
}
