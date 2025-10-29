// products.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient } from '@angular/common/http';
import { HeadersService } from '../headers.service';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  UpdateStockDto, 
  ProductQueryParams, 
  PaginatedProductsResponse, 
  StockMovementResponseDto
} from '../../interfaces/product.interfaces';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends BaseApiService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

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

  // ===== MÉTODOS PRINCIPALES =====

  createProduct(dto: CreateProductDto): Observable<ApiResponse<Product>> {
    this.ensureTenantId();
    return this.post<ApiResponse<Product>>('products', dto).pipe(
      map(response => response)
    );
  }
  updateProduct(id: string, dto: UpdateProductDto): Observable<ApiResponse<Product>> {
    this.ensureTenantId();
  
    const { id: _, ...updateData } = dto;
    
    return this.put<ApiResponse<Product>>(`products/${id}`, updateData).pipe(
      map(response => response)
    );
  }

  updateProductStock(id: string, dto: UpdateStockDto): Observable<ApiResponse<Product>> {
    this.ensureTenantId();

    
    return this.put<ApiResponse<Product>>(`products/${id}/stock`, dto).pipe(
      map(response => response)
    );
  }
  getProducts(params: ProductQueryParams): Observable<ApiResponse<Product>> {
    this.ensureTenantId();
    
    const queryParams: any = { ...params };
    
    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<ApiResponse<Product>>('products', queryParams).pipe(
      map(response => response)
    );
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    this.ensureTenantId();


    return this.get<ApiResponse<Product>>(`products/${id}`).pipe(
      map(response => response)
    );
  }

    getProductHistoryMovement(id: string): Observable<ApiPaginatedResponse<StockMovementResponseDto>> {
    this.ensureTenantId();


    return this.post<ApiPaginatedResponse<StockMovementResponseDto>>(`products/${id}/stock-history`, {}).pipe(
      map(response => response)
    );
  }

  getProductsSummary(params: ProductQueryParams): Observable<ApiPaginatedResponse<Product>> {
    this.ensureTenantId();
    
    const queryParams: any = { ...params };
    
    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<ApiPaginatedResponse<Product>>('products/summary', queryParams).pipe(
      map(response => response)
    );
  }
  // ===== MÉTODOS DE VALIDACIÓN =====

  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

  
}