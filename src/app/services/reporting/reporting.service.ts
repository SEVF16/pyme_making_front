// reporting.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';

import {
  ExecutiveDashboardDto,
  SalesByPeriodDto,
  TopProductsDto,
  CustomerStatementDto,
  OverdueReceivablesDto,
  ValuedInventoryDto,
  PosCashSummaryDto,
  ReportRequestDto,
  TopProductsRequestDto
} from '../../interfaces/reporting.interfaces';
import { HeadersService } from '../headers.service';

@Injectable({
  providedIn: 'root'
})
export class ReportingService extends BaseApiService {
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

  // ==================== DASHBOARD ====================

  /**
   * Obtener dashboard ejecutivo con métricas de alto nivel
   */
  getExecutiveDashboard(request: ReportRequestDto): Observable<ExecutiveDashboardDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<ExecutiveDashboardDto>('reports/executive-dashboard', params);
  }

  // ==================== SALES REPORTS ====================

  /**
   * Obtener datos de ventas por período
   */
  getSalesByPeriod(request: ReportRequestDto): Observable<SalesByPeriodDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<SalesByPeriodDto>('reports/sales-by-period', params);
  }

  /**
   * Obtener productos más vendidos
   */
  getTopSellingProducts(request: TopProductsRequestDto): Observable<TopProductsDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<TopProductsDto>('reports/top-selling-products', params);
  }

  // ==================== CUSTOMER REPORTS ====================

  /**
   * Obtener estado de cuenta de cliente
   */
  getCustomerStatement(
    customerId: string,
    request: ReportRequestDto
  ): Observable<CustomerStatementDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<CustomerStatementDto>(`reports/customer-statement/${customerId}`, params);
  }

  // ==================== FINANCIAL REPORTS ====================

  /**
   * Obtener cuentas por cobrar vencidas
   */
  getOverdueReceivables(request: ReportRequestDto): Observable<OverdueReceivablesDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<OverdueReceivablesDto>('reports/overdue-receivables', params);
  }

  // ==================== INVENTORY REPORTS ====================

  /**
   * Obtener inventario valorizado
   */
  getValuedInventory(): Observable<ValuedInventoryDto> {
    this.ensureTenantId();
    return this.get<ValuedInventoryDto>('reports/valued-inventory');
  }

  // ==================== POS REPORTS ====================

  /**
   * Obtener resumen de efectivo POS
   */
  getPosCashSummary(request: ReportRequestDto): Observable<PosCashSummaryDto> {
    this.ensureTenantId();
    const params = this.buildReportParams(request);
    return this.get<PosCashSummaryDto>('reports/pos-cash-summary', params);
  }

  // ==================== UTILITIES ====================

  /**
   * Construye los parámetros de query desde el DTO de reporte
   */
  private buildReportParams(request: any): any {
    const params: any = {};

    if (request.period) params['period'] = request.period;
    if (request.startDate) params['startDate'] = request.startDate;
    if (request.endDate) params['endDate'] = request.endDate;
    if (request.format) params['format'] = request.format;
    if (request.limit !== undefined) params['limit'] = request.limit.toString();

    return params;
  }
}
