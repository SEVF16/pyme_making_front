import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseTotalComponent } from './components/purchase-total/purchase-total.component';
import { PurchaseProductsComponent } from './components/purchase-products/purchase-products.component';
import { PurchasePaymentComponent } from './components/purchase-payment/purchase-payment.component';
import { Purchase, PurchaseItem, PaymentMethod, PurchaseChangeEvent } from '../../interfaces/purchase/purchase.interfaces';
import { PurchaseModel } from '../../interfaces/purchase/purchase.models';
import { AutocompleteLibComponent } from '../../shared/components/autocomplete-lib/autocomplete-lib.component';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Option } from '../../shared/components/select-lib/select-lib.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductsService } from '../../services/products/products.service';
import { Product, ProductQueryParams } from '../../interfaces/product.interfaces';
import { ApiResponse } from '../../interfaces/api-response.interfaces';

/**
 * Componente Smart/Container para gestionar el resumen de compra
 *
 * Responsabilidades:
 * - Gestiona el estado de la compra (productos, totales, método de pago)
 * - Coordina la comunicación entre componentes hijos (dumb components)
 * - Maneja la lógica de negocio (cálculos, validaciones)
 * - Emite eventos hacia componentes padres
 *
 * Arquitectura:
 * - Este es un Smart Component que contiene lógica de negocio
 * - Los componentes hijos son Dumb/Presentacionales que solo reciben datos y emiten eventos
 * - Usa signals de Angular 18 para un manejo de estado reactivo y eficiente
 */
@Component({
  selector: 'app-purchase-summary',
  standalone: true,
  imports: [
    CommonModule,
    PurchaseTotalComponent,
    PurchaseProductsComponent,
    PurchasePaymentComponent,
    AutocompleteLibComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-summary.component.html',
})
export class PurchaseSummaryComponent implements OnInit {
  // Inputs
  @Input() initialPurchase?: Purchase;
  @Input() paymentMethods: PaymentMethod[] = [
    {
      id: 'pm-001',
      type: 'cash',
      name: 'Efectivo',
      description: 'Pago en efectivo',
      isActive: true
    },
    {
      id: 'pm-002',
      type: 'credit_card',
      name: 'Tarjeta de Crédito',
      description: 'Visa, Mastercard, American Express',
      isActive: true
    },
    {
      id: 'pm-003',
      type: 'debit_card',
      name: 'Tarjeta de Débito',
      description: 'Débito Visa o Mastercard',
      isActive: true
    },
    {
      id: 'pm-004',
      type: 'transfer',
      name: 'Transferencia Bancaria',
      description: 'Transferencia electrónica',
      isActive: true
    },
    {
      id: 'pm-005',
      type: 'check',
      name: 'Cheque',
      description: 'Cheque al día o a fecha',
      isActive: false
    }
  ];
  @Input() readonly: boolean = false;
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() showActions: boolean = true;
  @Input() showValidationStatus: boolean = true;
  @Input() saveButtonLabel: string = 'Guardar Compra';

  // Outputs
  @Output() purchaseChange = new EventEmitter<PurchaseChangeEvent>();
  @Output() save = new EventEmitter<Purchase>();
  @Output() clear = new EventEmitter<void>();

  // State usando signals (Angular 18)
  private purchaseModel = signal<PurchaseModel>(new PurchaseModel());

  // Computed signals para valores derivados
  protected products = computed(() => this.purchaseModel().items);
  protected subtotal = computed(() => this.purchaseModel().subtotal);
  protected totalDiscount = computed(() => this.purchaseModel().totalDiscount);
  protected totalTax = computed(() => this.purchaseModel().totalTax);
  protected total = computed(() => this.purchaseModel().total);
  protected itemsCount = computed(() => this.purchaseModel().getItemsCount());
  protected totalQuantity = computed(() => this.purchaseModel().getTotalQuantity());
  protected selectedPaymentMethodId = computed(() => this.purchaseModel().paymentMethodId);
  protected selectedPaymentMethod = computed(() => this.purchaseModel().paymentMethod);
  protected purchaseNumber = computed(() => this.purchaseModel().purchaseNumber);
  protected isValid = computed(() => this.purchaseModel().isValid());
  protected validationMessage = computed(() => this.getValidationMessage());
  private destroy$ = new Subject<void>();

  isLoading = false;
  productOptions: Option[] = [];
  productsSummary: Product[] = [];
  form!: FormGroup;
    constructor(
      private readonly formBuilder: FormBuilder,
      private productService: ProductsService,
      private cdr: ChangeDetectorRef
    ) {
      this.form = this.formBuilder.group({
        selectedUser: ['']
      });
    }
  
  ngOnInit(): void {
    if (this.initialPurchase) {
      this.purchaseModel.set(new PurchaseModel(this.initialPurchase));
    }
    this.emitChange();
        this.form.get('selectedUser')?.valueChanges.pipe(
          debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
          distinctUntilChanged(), // Solo emite si el valor cambió
          switchMap(query => this.performSearch(query || '')),
          takeUntil(this.destroy$)
        ).subscribe({
          next: (options: Option[]) => {
            this.productOptions = options;
            this.isLoading = false;
            this.cdr.markForCheck(); // Marcar para detección de cambios
          },
          error: (error) => {
            console.error('Error en búsqueda de productos:', error);
            this.productOptions = [];
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
  }
  private performSearch(query: string) {
    if (query.length < 3) {
      this.isLoading = true;
      return of([]);
    }

    // Activar loading state
    this.isLoading = true;
    this.cdr.markForCheck();

    const params: ProductQueryParams = {
      q: query,
      limit: 10
    };

    return this.productService.getProductsSearch(params).pipe(
      map((response: ApiResponse<Product[]>) => {
        this.productsSummary = response.data;
        return response.data.map(product => ({
          label: `${product.name} - ${product.barcode}`,
          value: product.id || ''
        }));
      }),
      catchError(error => {
        console.error('Error searching products:', error);
        return of([]);
      })
    );
  }

    onUserSelect(option: Option) {

const selectedProduct = this.productsSummary.find(product => product.id === option.value);
    
    if (selectedProduct) {
      
      // Verificar si el producto ya existe en los items
      const currentModel = this.purchaseModel();
      const existingItemIndex = currentModel.items.findIndex(item => item.productId === selectedProduct.id);
      
      if (existingItemIndex >= 0) {
        // Si el producto ya existe, incrementar la cantidad
        const updatedItems = [...currentModel.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          subtotal: existingItem.unitPrice * (existingItem.quantity + 1),
          total: (existingItem.unitPrice * (existingItem.quantity + 1)) - (existingItem.discount || 0) + (existingItem.tax || 0)
        };
        
        this.updatePurchaseModelWithItems(updatedItems);

      } else {
        // Si es un producto nuevo, agregarlo
        const newPurchaseItem: PurchaseItem = {
          productId: selectedProduct.id || '',
          productName: selectedProduct.name,
          productSku: selectedProduct.barcode || selectedProduct.sku || '',
          quantity: 1,
          unitPrice: Number(selectedProduct.price) || 0, // Convertir a número
          subtotal: Number(selectedProduct.price) || 0,   // Convertir a número
          discount: 0,
          tax: 0,
          total: Number(selectedProduct.price) || 0       // Convertir a número
        };
        
        const updatedItems = [...currentModel.items, newPurchaseItem];
        this.updatePurchaseModelWithItems(updatedItems);

      }
      
      

    }
    // Lógica adicional cuando se selecciona un producto
  }
private updatePurchaseModelWithItems(items: PurchaseItem[]): void {
  const currentModel = this.purchaseModel();
  
  const newModel = new PurchaseModel();
  Object.assign(newModel, currentModel);
  newModel.items = items;
  
  // Recalcular todos los totales
  newModel.subtotal = newModel.calculateSubtotal();
  newModel.totalDiscount = newModel.calculateTotalDiscount();
  newModel.totalTax = newModel.calculateTotalTax();
  newModel.total = newModel.calculateTotal();
  
  
  this.purchaseModel.set(newModel);
}
  onUserClear() {
    console.log('Autocomplete limpiado');
    this.productOptions = [];
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Maneja la eliminación de un producto
   */
  handleRemoveProduct(index: number): void {
    const model = this.purchaseModel();
    model.removeItem(index);
    this.purchaseModel.set(new PurchaseModel(model));
    this.emitChange();
  }

  /**
   * Maneja el cambio de cantidad de un producto
   */
  handleQuantityChange(event: { index: number; quantity: number }): void {
    const model = this.purchaseModel();
    const item = model.items[event.index];
    if (item) {
      model.updateItem(event.index, { ...item, quantity: event.quantity });
      this.purchaseModel.set(new PurchaseModel(model));
      this.emitChange();
    }
  }

  /**
   * Maneja la selección de método de pago
   */
  handlePaymentMethodSelect(paymentMethod: PaymentMethod): void {
    const model = this.purchaseModel();
    model.setPaymentMethod(paymentMethod);
    this.purchaseModel.set(new PurchaseModel(model));
    this.emitChange();
  }

  /**
   * Maneja el guardado de la compra
   */
  handleSave(): void {
    if (this.isValid()) {
      this.save.emit(this.purchaseModel());
    }
  }

  /**
   * Maneja la limpieza de la compra
   */
  handleClear(): void {
    const model = this.purchaseModel();
    model.clear();
    this.purchaseModel.set(new PurchaseModel(model));
    this.clear.emit();
    this.emitChange();
  }

  /**
   * Emite el evento de cambio
   */
  private emitChange(): void {
    this.purchaseChange.emit({
      purchase: this.purchaseModel(),
      isValid: this.isValid()
    });
  }

  /**
   * Obtiene el mensaje de validación
   */
  private getValidationMessage(): string {
    const model = this.purchaseModel();

    if (model.items.length === 0) {
      return 'Debe agregar al menos un producto';
    }

    if (model.total <= 0) {
      return 'El total debe ser mayor a cero';
    }

    if (!model.companyId) {
      return 'Debe seleccionar una empresa';
    }

    return 'Compra válida';
  }

  /**
   * Métodos públicos para interacción externa
   */

  /**
   * Agrega un producto a la compra
   */
  addProduct(product: PurchaseItem): void {
    const model = this.purchaseModel();
    model.addItem(product);
    this.purchaseModel.set(new PurchaseModel(model));
    this.emitChange();
  }

  /**
   * Obtiene la compra actual
   */
  getCurrentPurchase(): Purchase {
    return this.purchaseModel();
  }

  /**
   * Resetea la compra con nuevos datos
   */
  resetPurchase(purchase?: Purchase): void {
    this.purchaseModel.set(new PurchaseModel(purchase));
    this.emitChange();
  }
}
