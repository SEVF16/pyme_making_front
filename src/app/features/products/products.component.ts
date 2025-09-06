// products.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products/products.service';
import { PaginatedProductsResponse, Product, ProductQueryParams } from '../../interfaces/product.interfaces';
import { ApiResponse } from '../../interfaces/api-response.interfaces';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { Building2, LucideAngularModule, Plus } from 'lucide-angular';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { SidebarViewComponent } from '../../shared/components/sidebar-view/sidebar-view.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { SidebarConfig } from '../../shared/components/sidebar-view/interfaces/siderbar-config.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDataTableComponent,
     LucideAngularModule, ButtonLibComponent, SidebarViewComponent, ProductFormComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  readonly Building2Icon = Building2;
  readonly PlusIcon = Plus;
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  
  // Parámetros de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  hasNext = false;
  

  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'name',
      header: 'Nombre',
    },
    {
      field: 'price',
      header: 'Precio',
    },
    {
      field: 'stock',
      header: 'Stock',
    },
    {
      field: 'status',
      header: 'Estatus',
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '150px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          tooltip: 'Ver detalles',
          command: (rowData, rowIndex) => this.loadProducts(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar empresa',
          command: (rowData, rowIndex) => this.loadProducts(rowData),
          visible: (rowData) => rowData.status !== 'Suspendido'
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar empresa',
          command: (rowData, rowIndex) => this.loadProducts(rowData),
          visible: (rowData) => rowData.status === 'Inactivo'
        }
      ]
    }
  ]);
  
  readonly tableConfig = signal<TableConfig>({
    showPaginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    responsive: true,
    dataKey: 'id',
    emptyMessage: 'No hay empresas registradas',
    tableStyleClass: 'table-hover'
  });

  public data: any = [];
  

  formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'full'  };
  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  openFormSidebar(): void {
    this.formSidebarConfig.visible = true;
  }

  closeFormSidebar(): void {
    this.formSidebarConfig.visible = false;
    
  }

  saveUser(): void {
      
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
    };

    this.productsService.getProductsSummary(queryParams).subscribe({
      next: (response: ApiResponse<Product>) => {
        console.log(response);
        this.products = response.data.result;
        this.hasNext = response.data.hasNext;
        this.currentPage = page;
        this.loading = false;
        this.setTable(response.data.result);
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  private setTable(products: Product[]): void {
    this.data = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      status: product.status,
      sku: product.sku,
      rawPrice: product.price,
      rawStatus: product.status
    }));
  }
}