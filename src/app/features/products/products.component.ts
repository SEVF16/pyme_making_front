// products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products/products.service';
import { PaginatedProductsResponse, Product, ProductQueryParams } from '../../interfaces/product.interfaces';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  
  // Parámetros de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  hasNext = false;
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  
  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    this.error = null;
    
    const offset = (page - 1) * this.itemsPerPage;
    
    const queryParams: ProductQueryParams = {
      limit: this.itemsPerPage,
      offset: offset,
      sortField: 'name',
      sortDirection: 'ASC',
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
      category: this.categoryFilter || undefined
    };

    this.productsService.getProducts(queryParams).subscribe({
      next: (response: PaginatedProductsResponse) => {
        console.log(response.data);
        this.products = response.data;
        this.hasNext = response.hasNext;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts(1);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts(1);
  }

  nextPage(): void {
    if (this.hasNext) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.loadProducts(1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.categoryFilter = '';
    this.currentPage = 1;
    this.loadProducts(1);
  }
}