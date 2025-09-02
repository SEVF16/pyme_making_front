// products.interface.ts
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  profitMargin?: number;
  category: string;
  brand?: string;
  productType: string;
  status: string;
  unit?: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  weight?: number;
  dimensions?: string;
  images?: string[];
  barcode?: string;
  isActive: boolean;
  allowNegativeStock: boolean;
  companyId: string;
  tags?: string[];
  additionalInfo?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  brand?: string;
  productType: string;
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
  additionalInfo?: any;
}

export interface UpdateProductDto {
  status?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  category?: string;
  brand?: string;
  productType?: string;
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
  tags?: string[];
  additionalInfo?: any;
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