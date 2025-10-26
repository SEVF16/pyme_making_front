import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseTotalComponent } from './components/purchase-total/purchase-total.component';
import { PurchaseProductsComponent } from './components/purchase-products/purchase-products.component';
import { PurchasePaymentComponent } from './components/purchase-payment/purchase-payment.component';
import { Purchase, PurchaseItem, PaymentMethod, PurchaseChangeEvent } from '../../interfaces/purchase/purchase.interfaces';
import { PurchaseModel } from '../../interfaces/purchase/purchase.models';

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
    PurchasePaymentComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="purchase-summary-container">
      <div class="summary-header">
        <h2>Resumen de Compra</h2>
        @if (purchaseNumber()) {
          <span class="purchase-number">{{ purchaseNumber() }}</span>
        }
      </div>

      <div class="summary-content" [class.layout-vertical]="layout === 'vertical'" [class.layout-horizontal]="layout === 'horizontal'">
        <!-- Sección de Productos -->
        <div class="section section-products">
          <app-purchase-products
            [products]="products()"
            [readonly]="readonly"
            (removeProduct)="handleRemoveProduct($event)"
            (quantityChange)="handleQuantityChange($event)"
          />
        </div>

        <!-- Sección lateral con Total y Método de Pago -->
        <div class="section section-sidebar">
          <!-- Sección de Total -->
          <div class="subsection">
            <app-purchase-total
              [subtotal]="subtotal()"
              [totalDiscount]="totalDiscount()"
              [totalTax]="totalTax()"
              [total]="total()"
              [itemsCount]="itemsCount()"
              [totalQuantity]="totalQuantity()"
            />
          </div>

          <!-- Sección de Método de Pago -->
          <div class="subsection">
            <app-purchase-payment
              [paymentMethods]="paymentMethods"
              [selectedPaymentMethodId]="selectedPaymentMethodId()"
              [selectedPaymentMethod]="selectedPaymentMethod()"
              [readonly]="readonly"
              (paymentMethodSelect)="handlePaymentMethodSelect($event)"
            />
          </div>

          <!-- Acciones -->
          @if (!readonly && showActions) {
            <div class="subsection actions-section">
              <button
                class="btn btn-secondary"
                (click)="handleClear()"
                [disabled]="itemsCount() === 0">
                Limpiar
              </button>
              <button
                class="btn btn-primary"
                (click)="handleSave()"
                [disabled]="!isValid()">
                {{ saveButtonLabel }}
              </button>
            </div>
          }

          <!-- Estado de validación -->
          @if (showValidationStatus) {
            <div class="subsection validation-status">
              @if (isValid()) {
                <div class="status-message status-valid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Compra válida</span>
                </div>
              } @else {
                <div class="status-message status-invalid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ validationMessage() }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .purchase-summary-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f3f4f6;
      border-radius: 12px;
      overflow: hidden;
    }

    .summary-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .purchase-number {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    .summary-content {
      flex: 1;
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      overflow: hidden;

      &.layout-horizontal {
        flex-direction: row;

        .section-products {
          flex: 2;
          min-width: 0;
        }

        .section-sidebar {
          flex: 1;
          min-width: 350px;
          max-width: 450px;
        }
      }

      &.layout-vertical {
        flex-direction: column;

        .section-products {
          flex: 1;
          min-height: 300px;
        }

        .section-sidebar {
          display: flex;
          gap: 1rem;

          .subsection {
            flex: 1;
          }

          .actions-section,
          .validation-status {
            flex: 0 0 auto;
          }
        }
      }
    }

    .section {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .section-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .subsection {
      flex-shrink: 0;

      &:has(app-purchase-total),
      &:has(app-purchase-payment) {
        flex-shrink: 1;
      }
    }

    .actions-section {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.938rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }

      &.btn-secondary {
        background: white;
        color: #6b7280;
        border: 2px solid #e5e7eb;

        &:hover:not(:disabled) {
          border-color: #d1d5db;
          background: #f9fafb;
        }
      }
    }

    .validation-status {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;

      svg {
        flex-shrink: 0;
      }

      &.status-valid {
        color: #10b981;
      }

      &.status-invalid {
        color: #ef4444;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .summary-content.layout-horizontal {
        flex-direction: column;

        .section-sidebar {
          max-width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
      }
    }

    @media (max-width: 640px) {
      .summary-header {
        padding: 1rem 1.5rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        h2 {
          font-size: 1.25rem;
        }
      }

      .summary-content {
        padding: 1rem;
        gap: 1rem;
      }

      .section-sidebar {
        grid-template-columns: 1fr !important;
      }

      .actions-section {
        flex-direction: column;
      }
    }
  `]
})
export class PurchaseSummaryComponent implements OnInit {
  // Inputs
  @Input() initialPurchase?: Purchase;
  @Input() paymentMethods: PaymentMethod[] = [];
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

  ngOnInit(): void {
    if (this.initialPurchase) {
      this.purchaseModel.set(new PurchaseModel(this.initialPurchase));
    }
    this.emitChange();
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
