/**
 * Tipo de producto disponible en el sistema
 */
export type ProductType = 'physical' | 'digital' | 'service';

/**
 * Información adicional del producto (campos dinámicos)
 */
export interface ProductAdditionalInfo {
  [key: string]: string | number | boolean;
}

/**
 * Interface para el modelo de Producto
 * Define la estructura de datos de un producto en el sistema
 */
export interface Product {
  // Identificación básica
  id?: string;
  sku: string;
  name: string;
  description: string;
  barcode?: string;

  // Información comercial
  price: number;
  costPrice?: number;
  category: string;
  brand?: string;
  productType: ProductType;
  
  // Inventario
  unit?: string;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  allowNegativeStock?: boolean;

  // Características físicas
  weight?: number;
  dimensions?: string;

  // Multimedia y clasificación
  images?: string[];
  tags?: string[];
  additionalInfo?: ProductAdditionalInfo;

  // Estado y relaciones
  isActive?: boolean;
  companyId: string;

  // Auditoría (opcional)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO para crear un nuevo producto
 * Contiene solo los campos necesarios para la creación
 */
export interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  brand?: string;
  productType: ProductType;
  unit?: string;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: string;
  images?: string[];
  barcode?: string;
  isActive?: boolean;
  allowNegativeStock?: boolean;
  companyId: string;
  tags?: string[];
  additionalInfo?: ProductAdditionalInfo;
}

/**
 * DTO para actualizar un producto existente
 * Todos los campos son opcionales excepto el ID
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

/**
 * Clase para el modelo de Producto con valores por defecto
 * Útil para instanciar productos con configuración inicial
 */
export class ProductModel implements Product {
  id?: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  brand?: string;
  productType: ProductType;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  weight?: number;
  dimensions?: string;
  images: string[];
  barcode?: string;
  isActive: boolean;
  allowNegativeStock: boolean;
  companyId: string;
  tags: string[];
  additionalInfo?: ProductAdditionalInfo;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<Product>) {
    // Identificación básica
    this.id = data?.id;
    this.sku = data?.sku || '';
    this.name = data?.name || '';
    this.description = data?.description || '';
    this.barcode = data?.barcode;

    // Información comercial
    this.price = data?.price || 0;
    this.costPrice = data?.costPrice;
    this.category = data?.category || '';
    this.brand = data?.brand;
    this.productType = data?.productType || 'physical';

    // Inventario
    this.unit = data?.unit || 'unidad';
    this.stock = data?.stock ?? 0;
    this.minStock = data?.minStock ?? 0;
    this.maxStock = data?.maxStock ?? 100;
    this.allowNegativeStock = data?.allowNegativeStock ?? false;

    // Características físicas
    this.weight = data?.weight;
    this.dimensions = data?.dimensions;

    // Multimedia y clasificación
    this.images = data?.images || [];
    this.tags = data?.tags || [];
    this.additionalInfo = data?.additionalInfo;

    // Estado y relaciones
    this.isActive = data?.isActive ?? true;
    this.companyId = data?.companyId || '';

    // Auditoría
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }

  /**
   * Convierte la instancia a un objeto plano para envío al backend
   */
  toCreateDto(): CreateProductDto {
    return {
      sku: this.sku,
      name: this.name,
      description: this.description,
      price: this.price,
      costPrice: this.costPrice,
      category: this.category,
      brand: this.brand,
      productType: this.productType,
      unit: this.unit,
      stock: this.stock,
      minStock: this.minStock,
      maxStock: this.maxStock,
      weight: this.weight,
      dimensions: this.dimensions,
      images: this.images,
      barcode: this.barcode,
      isActive: this.isActive,
      allowNegativeStock: this.allowNegativeStock,
      companyId: this.companyId,
      tags: this.tags,
      additionalInfo: this.additionalInfo,
    };
  }

  /**
   * Calcula el margen de ganancia del producto
   */
  getMargin(): number {
    if (!this.costPrice || this.costPrice === 0) return 0;
    return ((this.price - this.costPrice) / this.costPrice) * 100;
  }

  /**
   * Verifica si el stock está por debajo del mínimo
   */
  isLowStock(): boolean {
    return this.stock < this.minStock;
  }

  /**
   * Verifica si el producto está disponible para venta
   */
  isAvailable(): boolean {
    return this.isActive && (this.allowNegativeStock || this.stock > 0);
  }

  /**
   * Obtiene la primera imagen del producto o un placeholder
   */
  getPrimaryImage(): string {
    return this.images.length > 0 
      ? this.images[0] 
      : 'assets/images/product-placeholder.jpg';
  }
}

export interface UpdateStockDto {
  quantity: number;
  movementType: 'INCREMENT' | 'DECREMENT' | 'SET';
  reason?: string;
  reference?: string;
}

export interface ProductQueryParams {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  companyId?: string;
  status?: string;
  category?: string;
  brand?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface PaginatedProductsResponse {
  data: Product[];
  hasNext: boolean;
  offset: number;
  limit: number;
  timestamp: string;
}

export interface ProductChangeEvent {
  product: CreateProductDto;
  isValid: boolean;
}
