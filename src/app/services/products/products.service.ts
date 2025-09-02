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
  PaginatedProductsResponse 
} from '../../interfaces/product.interfaces';

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

  getProducts(params: ProductQueryParams): Observable<PaginatedProductsResponse> {
    this.ensureTenantId();
    
    const queryParams: any = { ...params };
    
    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<PaginatedProductsResponse>('products', queryParams).pipe(
      map(response => response)
    );
  }

  getProductById(id: string): Observable<Product> {
    this.ensureTenantId();
    return this.get<Product>(`products/${id}`);
  }

  createProduct(productData: CreateProductDto): Observable<Product> {
    this.ensureTenantId();
    
    // Asegurar que el companyId coincida con el tenant-id
    if (!productData.companyId && this.currentTenantId) {
      productData.companyId = this.currentTenantId;
    }
    
    return this.post<Product>('products', productData);
  }

  updateProduct(id: string, productData: UpdateProductDto): Observable<Product> {
    this.ensureTenantId();
    return this.put<Product>(`products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<void> {
    this.ensureTenantId();
    return this.delete<void>(`products/${id}`);
  }

  updateProductStatus(id: string, status: string): Observable<Product> {
    this.ensureTenantId();
    return this.patch<Product>(`products/${id}/status`, { status });
  }

  updateStock(id: string, stockData: UpdateStockDto): Observable<Product> {
    this.ensureTenantId();
    return this.patch<Product>(`products/${id}/stock`, stockData);
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTROS =====

  searchProducts(searchTerm: string, companyId?: string): Observable<Product[]> {
    this.ensureTenantId();
    
    const params: any = { 
      search: searchTerm,
      companyId: companyId || this.currentTenantId
    };
    
    return this.get<Product[]>('products/search', params);
  }

  getProductsByCategory(category: string, companyId?: string): Observable<Product[]> {
    this.ensureTenantId();
    
    const params: any = { 
      category,
      companyId: companyId || this.currentTenantId
    };
    
    return this.get<Product[]>('products/category', params);
  }

  getLowStockProducts(companyId?: string): Observable<Product[]> {
    this.ensureTenantId();
    
    const params: any = { 
      companyId: companyId || this.currentTenantId
    };
    
    return this.get<Product[]>('products/low-stock', params);
  }

  getOutOfStockProducts(companyId?: string): Observable<Product[]> {
    this.ensureTenantId();
    
    const params: any = { 
      companyId: companyId || this.currentTenantId
    };
    
    return this.get<Product[]>('products/out-of-stock', params);
  }

  // ===== MÉTODOS DE VALIDACIÓN =====

  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

  // ===== MÉTODOS DE GESTIÓN DE ESTADO LOCAL =====

  addProductToLocalState(product: Product): void {
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, product]);
  }

  updateProductInLocalState(updatedProduct: Product): void {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(product =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    this.productsSubject.next(updatedProducts);
  }

  removeProductFromLocalState(productId: string): void {
    const currentProducts = this.productsSubject.value;
    const filteredProducts = currentProducts.filter(product => product.id !== productId);
    this.productsSubject.next(filteredProducts);
  }

  clearLocalProducts(): void {
    this.productsSubject.next([]);
  }

  // ===== UTILIDADES =====

  calculateProfitMargin(price: number, costPrice: number): number {
    if (!costPrice || costPrice <= 0) return 0;
    return ((price - costPrice) / costPrice) * 100;
  }

  isLowStock(stock: number, minStock: number): boolean {
    return stock <= minStock;
  }

  isOutOfStock(stock: number): boolean {
    return stock <= 0;
  }

  // ===== MÉTODOS DE FORMATEO =====

  formatProductForCreation(product: any, companyId?: string): CreateProductDto {
    return {
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      category: product.category,
      brand: product.brand,
      productType: product.productType,
      unit: product.unit,
      stock: product.stock || 0,
      minStock: product.minStock || 0,
      maxStock: product.maxStock,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images,
      barcode: product.barcode,
      isActive: product.isActive !== undefined ? product.isActive : true,
      allowNegativeStock: product.allowNegativeStock || false,
      companyId: companyId || this.currentTenantId || '',
      tags: product.tags,
      additionalInfo: product.additionalInfo
    };
  }
}