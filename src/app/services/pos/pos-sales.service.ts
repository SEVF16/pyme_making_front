import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../api/base-api.service';
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
import { PaginatedResponse } from '../../interfaces/common.interfaces';

@Injectable({
  providedIn: 'root'
})
export class POSSalesService extends BaseApiService<
  POSSaleResponseDto,
  CreatePOSSaleDto,
  UpdatePOSSaleDto
> {
  protected override endpoint = 'pos/sales';

  /**
   * Obtener ventas abiertas
   */
  getOpenSales(): Observable<POSSaleResponseDto[]> {
    return this.http.get<POSSaleResponseDto[]>(
      `${this.apiUrl}/${this.endpoint}/open`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estadísticas de ventas
   */
  getSalesStats(startDate?: string, endDate?: string): Observable<POSSalesStatsDto> {
    let url = `${this.apiUrl}/${this.endpoint}/stats`;
    const params: string[] = [];

    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<POSSalesStatsDto>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtener ventas por método de pago
   */
  getSalesByPaymentMethod(startDate?: string, endDate?: string): Observable<SalesByPaymentMethodDto> {
    let url = `${this.apiUrl}/${this.endpoint}/by-payment-method`;
    const params: string[] = [];

    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<SalesByPaymentMethodDto>(url, { headers: this.getHeaders() });
  }

  /**
   * Completar venta
   */
  completeSale(id: string, dto: CompletePOSSaleDto): Observable<POSSaleResponseDto> {
    return this.http.patch<POSSaleResponseDto>(
      `${this.apiUrl}/${this.endpoint}/${id}/complete`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancelar venta
   */
  cancelSale(id: string, dto: CancelPOSSaleDto): Observable<POSSaleResponseDto> {
    return this.http.patch<POSSaleResponseDto>(
      `${this.apiUrl}/${this.endpoint}/${id}/cancel`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Reembolsar venta
   */
  refundSale(id: string, dto: RefundPOSSaleDto): Observable<POSSaleResponseDto> {
    return this.http.patch<POSSaleResponseDto>(
      `${this.apiUrl}/${this.endpoint}/${id}/refund`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Listar ventas con filtros (override para agregar tipado específico)
   */
  override list(query?: POSSaleQueryDto): Observable<PaginatedResponse<POSSaleResponseDto>> {
    return super.list(query);
  }
}
