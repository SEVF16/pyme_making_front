import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CreateProductDto, Product, StockMovementResponseDto, UpdateProductDto, UpdateStockDto } from '../../../interfaces/product.interfaces';
import { ApiPaginatedResponse, ApiResponse } from '../../../interfaces/api-response.interfaces';
import { ProductsService } from '../../../services/products/products.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CustomDataTableComponent } from '../../../shared/components/data-table/custom-data-table.component';
import { TableColumn, TableConfig } from '../../../shared/components/data-table/models/data-table.models';
import { ProductFormComponent } from '../product-form/product-form.component';
import { SidebarViewComponent } from '../../../shared/components/sidebar-view/sidebar-view.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { SidebarConfig } from '../../../shared/components/sidebar-view/interfaces/siderbar-config.interface';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';
import { StockFormComponent } from '../stock-form/stock-form.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    LucideAngularModule,
    TooltipModule,
    CustomDataTableComponent,
    ButtonLibComponent, SidebarViewComponent, ProductFormComponent,
    StockFormComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  public readonly iconPencil = Pencil;
  public readonly iconArrow = ArrowLeft;
  readonly PlusIcon = Plus;
  public product!: Product;
  public isLoading: boolean = true;
  public isLoadingHistory: boolean = false;
  public historyMovements: StockMovementResponseDto[] = [];
  public data: any[] = [];
  public historyTableColumns: TableColumn[] = [];
  public historyTableConfig: TableConfig = {};

  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productId: string = '';
  formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'full'  };
  isDisabled : boolean = false;
  private updateProductDto!: UpdateProductDto;
  private updateStockDto!: UpdateStockDto;
  /**
   * Product data to pass to the form component
   * This will be populated when editing an existing product
   */
  public productDataForEdit: Product | null = null;
  public viewFormStock: boolean = false;
  public viewFormProduct: boolean = false;
  constructor(
    private productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    this.initializeHistoryTable();
    this.productId = this.route.snapshot.params['id'];
    if (this.productId) {
      this.getProduct(this.productId);
      this.getProductHistoryMovement(this.productId);
    }
  }

  /**
   * Inicializa la configuración de la tabla de historial de movimientos
   */
  private initializeHistoryTable(): void {
    this.historyTableColumns = [
      {
        field: 'createdAt',
        header: 'Fecha',
        customRender: (rowData: StockMovementResponseDto) => {
          return new Date(rowData.createdAt).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      },
      {
        field: 'movementType',
        header: 'Tipo',
        customRender: (rowData: StockMovementResponseDto) => {
          const types: { [key: string]: string } = {
            'in': 'Entrada',
            'out': 'Salida',
            'adjustment': 'Ajuste'
          };
          return types[rowData.movementType] || rowData.movementType;
        }
      },
      {
        field: 'quantity',
        header: 'Cantidad',
        customRender: (rowData: StockMovementResponseDto) => {
          const prefix = rowData.movementType === 'in' ? '+' : rowData.movementType === 'out' ? '-' : '';
          return `${prefix}${rowData.quantity}`;
        }
      },
      {
        field: 'previousStock',
        header: 'Stock Anterior',

      },
      {
        field: 'newStock',
        header: 'Stock Nuevo',
      },
      {
        field: 'reason',
        header: 'Motivo',
        customRender: (rowData: StockMovementResponseDto) => {
          return rowData.reason || '--';
        }
      },
      {
        field: 'reference',
        header: 'Referencia',

        customRender: (rowData: StockMovementResponseDto) => {
          return rowData.reference || '--';
        }
      },
      {
        field: 'unitCost',
        header: 'Costo Unitario',
        customRender: (rowData: StockMovementResponseDto) => {
          return rowData.unitCost
            ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rowData.unitCost)
            : '--';
        }
      },
      {
        field: 'totalCost',
        header: 'Costo Total',
        customRender: (rowData: StockMovementResponseDto) => {
          return rowData.totalCost
            ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(rowData.totalCost)
            : '--';
        }
      }
    ];

    this.historyTableConfig = {
      showPaginator: true,
      rows: 10,
      rowsPerPageOptions: [5, 10, 25, 50],
      responsive: true,
      emptyMessage: 'No se encontraron movimientos de inventario',
      tableStyleClass: 'p-datatable-sm',
      dataKey: 'id'
    };
  }

  /**
   * Obtiene los detalles de un producto por su ID
   * Como no existe un método getProduct individual, usamos getProducts con búsqueda
   */
  getProduct(id: string): void {
    this.isLoading = true;

    // Usamos getProducts para buscar el producto específico
    this.productsService.getProduct(id).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response && response.data) {
         this.product = response.data;
        
          
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el producto:', error);
        this.notificationService.showError('Error al cargar el producto');
        this.isLoading = false;
        //this.backPage();
      }
    });
  }
  /**
   * Obtiene el historial de movimientos del producto
   */
  getProductHistoryMovement(id: string): void {
    this.isLoadingHistory = true;

    this.productsService.getProductHistoryMovement(id).subscribe({
      next: (response: ApiPaginatedResponse<StockMovementResponseDto>) => {
        if (response && response.data) {

            this.setTable(response.data.result);
        } else {
          this.historyMovements = [];
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error al obtener el historial de movimientos:', error);
        this.notificationService.showError('Error al cargar el historial de movimientos');
        this.historyMovements = [];
        this.isLoadingHistory = false;
      }
    });
  }

  /**
   * Prepara los datos de movimientos para la tabla
   */
  private setTable(movements: StockMovementResponseDto[]): void {
    this.data = movements.map(movement => ({
      createdAt: movement.createdAt,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      reason: movement.reason,
      reference: movement.reference,
      unitCost: movement.unitCost,
      totalCost: movement.totalCost
    }));
  }
  /**
   * Navega de regreso a la lista de productos
   */
  public backPage(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Abre el formulario de edición del producto
   * Passes the current product data to the form component
   */
  openFormSidebar(): void {
    // Pass the current product data to the form for editing
    this.productDataForEdit = this.product;
    this.formSidebarConfig.visible = true;
    this.viewFormProduct = true;
  }


  openFormStockSidebar(): void {
    // Pass the current product data to the form for editing
    this.formSidebarConfig.visible = true;
    this.viewFormStock = true;
  }
  /**
   * Obtiene el color del tag según el estado del producto
   */
  getStatusSeverity(isActive: boolean | undefined): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  /**
   * Obtiene el color del tag según el tipo de producto
   */
  getProductTypeSeverity(type: string): 'info' | 'success' | 'warning' {
    switch(type) {
      case 'physical': return 'info';
      case 'digital': return 'success';
      case 'service': return 'warning';
      default: return 'info';
    }
  }

  /**
   * Verifica si el producto tiene stock bajo
   */
  isLowStock(): boolean {
    if (!this.product || this.product.stock === undefined || this.product.minStock === undefined) {
      return false;
    }
    return this.product.stock < this.product.minStock;
  }

  /**
   * Verifica si el producto está fuera de stock
   */
  isOutOfStock(): boolean {
    if (!this.product || this.product.stock === undefined) {
      return false;
    }
    return this.product.stock === 0;
  }

  /**
   * Calcula el margen de ganancia del producto
   */
  calculateMargin(): number {
    if (!this.product || !this.product.costPrice || this.product.costPrice === 0) {
      return 0;
    }
    return ((this.product.price - this.product.costPrice) / this.product.costPrice) * 100;
  }

  /**
   * Formatea el tipo de producto para mostrar
   */
  formatProductType(type: string): string {
    const types: { [key: string]: string } = {
      'physical': 'Físico',
      'digital': 'Digital',
      'service': 'Servicio'
    };
    return types[type] || type;
  }

  onProductChange(productEvent: DataChangeEvent<CreateProductDto>): void {
  
    this.isDisabled = productEvent.isValid;
    this.updateProductDto = {
      id: this.productId, 
      ...productEvent.data
    };
    this.updateProductDto.companyId = this.product.companyId;
  }

    onStockChange(productEvent: DataChangeEvent<UpdateStockDto>): void {
  
    this.isDisabled = productEvent.isValid;
    this.updateStockDto = {
      ...productEvent.data
    };
  }

  closeFormSidebar(): void {
    this.formSidebarConfig.visible = false;
    // Clear the product data when closing
   this.viewFormProduct = false;
   this.viewFormStock = false;
  }


  onActionComplete(): void {
    if (this.viewFormProduct) {
      this.editProduct();
    }else if (this.viewFormStock) {
      this.updateStockProduct();
    }
  }

  updateStockProduct(): void {
    this.isLoadingHistory = true;
    console.log(this.updateProductDto);
    this.productsService.updateProductStock(this.productId, this.updateStockDto).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response && response.data) {
          this.closeFormSidebar();
          this.notificationService.showSuccess('Stock actualizado con éxito');
          this.product = response.data;
          this.getProductHistoryMovement(this.productId);
        } else {
          this.historyMovements = [];
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error al obtener el historial de movimientos:', error);
        this.notificationService.showError('Error al cargar el historial de movimientos');
        this.historyMovements = [];
        this.isLoadingHistory = false;
      }
    });
  }
  editProduct(): void {
    this.isLoadingHistory = true;
    
    this.productsService.updateProduct(this.productId, this.updateProductDto).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response && response.data) {
          this.closeFormSidebar();
          this.notificationService.showSuccess('Producto actualizado con éxito');
          this.product = response.data;
        } else {
          this.historyMovements = [];
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error al obtener el historial de movimientos:', error);
        this.notificationService.showError('Error al cargar el historial de movimientos');
        this.historyMovements = [];
        this.isLoadingHistory = false;
      }
    });
  }
}
