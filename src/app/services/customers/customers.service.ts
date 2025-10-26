import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient } from '@angular/common/http';
import { HeadersService } from '../headers.service';
import { isPlatformBrowser } from '@angular/common';
import { CustomerQueryDto } from '../../interfaces/customers/customers-query-params.interfaces';
import { map, Observable } from 'rxjs';

import { ICreateCustomerDto, ICustomer, IUpdateCustomerDto } from '../../interfaces/customers/customers.interfaces';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CustomersService extends BaseApiService {
  private currentTenantId: string | null = null;

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    
    // Inicializar tenant-id si está disponible
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

  getCustomers(params: CustomerQueryDto): Observable<ApiPaginatedResponse<ICustomer>> {
    this.ensureTenantId();
    
    const queryParams: any = { ...params };
    
    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<ApiPaginatedResponse<ICustomer>>('customers/summary', queryParams).pipe(
      map(response => response)
    );
  }

  getCustomer(id: string): Observable<ApiResponse<ICustomer>> {
    this.ensureTenantId();


    return this.get<ApiResponse<ICustomer>>(`customers/${id}`).pipe(
      map(response => response)
    );
  }

  createCustomer(dto: ICreateCustomerDto): Observable<ApiResponse<ICustomer>> {
    this.ensureTenantId();
    return this.post<ApiResponse<ICustomer>>('customers', dto).pipe(
      map(response => response)
    );
  }

  updateCustomer(id: string, dto: IUpdateCustomerDto): Observable<ApiResponse<ICustomer>> {
  this.ensureTenantId();
 
  const { id: _, ...updateData } = dto;
  
  return this.put<ApiResponse<ICustomer>>(`customers/${id}`, updateData).pipe(
    map(response => response)
  );
}
  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

}
