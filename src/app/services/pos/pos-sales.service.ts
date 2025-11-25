import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import {
  POSSaleResponseDto,
  CreatePOSSaleDto,
  UpdatePOSSaleDto,
  CompletePOSSaleDto,
  CancelPOSSaleDto,
  RefundPOSSaleDto,
  POSSaleQueryDto,
  POSSalesStatsDto,
  SalesByPaymentMethodDto
} from '../../interfaces/pos.interfaces';
import { PaginatedResponse } from '../../interfaces/purchase-order.interfaces';


@Injectable({
  providedIn: 'root'
})
export class POSSalesService extends BaseApiService {
  private tenantId: string | null = null;
  private endpoint = 'pos/sales';

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

  /**
   * Crear una nueva venta
   */
  create(dto: CreatePOSSaleDto): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.post<POSSaleResponseDto>(this.endpoint, dto);
  }

  /**
   * Actualizar una venta
   */
  update(id: string, dto: UpdatePOSSaleDto): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.put<POSSaleResponseDto>(`${this.endpoint}/${id}`, dto);
  }

  /**
   * Obtener ventas abiertas
   */
  getOpenSales(): Observable<POSSaleResponseDto[]> {
    this.ensureTenantId();
    return this.get<POSSaleResponseDto[]>(`${this.endpoint}/open`);
  }

  /**
   * Obtener estadísticas de ventas
   */
  getSalesStats(startDate?: string, endDate?: string): Observable<POSSalesStatsDto> {
    this.ensureTenantId();
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.get<POSSalesStatsDto>(`${this.endpoint}/stats`, params);
  }

  /**
   * Obtener ventas por método de pago
   */
  getSalesByPaymentMethod(startDate?: string, endDate?: string): Observable<SalesByPaymentMethodDto> {
    this.ensureTenantId();
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.get<SalesByPaymentMethodDto>(`${this.endpoint}/by-payment-method`, params);
  }

  /**
   * Completar venta
   */
  completeSale(id: string, dto: CompletePOSSaleDto): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.patch<POSSaleResponseDto>(`${this.endpoint}/${id}/complete`, dto);
  }

  /**
   * Cancelar venta
   */
  cancelSale(id: string, dto: CancelPOSSaleDto): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.patch<POSSaleResponseDto>(`${this.endpoint}/${id}/cancel`, dto);
  }

  /**
   * Reembolsar venta
   */
  refundSale(id: string, dto: RefundPOSSaleDto): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.patch<POSSaleResponseDto>(`${this.endpoint}/${id}/refund`, dto);
  }

  /**
   * Listar ventas con filtros
   */
  list(query?: POSSaleQueryDto): Observable<PaginatedResponse<POSSaleResponseDto>> {
    this.ensureTenantId();
    return this.get<PaginatedResponse<POSSaleResponseDto>>(this.endpoint, query);
  }

  /**
   * Obtener venta por ID
   */
  getById(id: string): Observable<POSSaleResponseDto> {
    this.ensureTenantId();
    return this.get<POSSaleResponseDto>(`${this.endpoint}/${id}`);
  }


}
