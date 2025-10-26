import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HeadersService } from '../headers.service';
import { BaseApiService } from '../base-api.service';
import { isPlatformBrowser } from '@angular/common';
import { IUserQuery } from '../../interfaces/users/users-query-params.interfaces';
import { map, Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import { ICreateUserDto, IUser } from '../../interfaces/users/user-interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseApiService{
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

  createUser(dto: ICreateUserDto): Observable<ApiResponse<IUser>> {
    this.ensureTenantId();
    return this.post<ApiResponse<IUser>>('users', dto).pipe(
      map(response => response)
    );
  }

  getUsers(params: IUserQuery): Observable<ApiPaginatedResponse<IUser[]>> {
    this.ensureTenantId();
    
    const queryParams: any = { ...params };
    
    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<ApiPaginatedResponse<IUser[]>>('users/summary', queryParams).pipe(
      map(response => response)
    );
  }
  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

}
