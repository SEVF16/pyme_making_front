import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PurchaseItem } from '../../../../interfaces/purchase/purchase.interfaces';

/**
 * Componente Dumb/Presentacional para mostrar los productos seleccionados
 *
 * Responsabilidades:
 * - Recibe lista de productos via @Input
 * - Emite eventos de acciones (eliminar, actualizar cantidad)
 * - Solo logica de presentacion
 * - Usa OnPush para optimizar rendimiento
 */
@Component({
  selector: 'app-purchase-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="purchase-products-card">
      <div class="products-header">
        <h3>Productos Seleccionados</h3>
        <span class="badge">{{ products.length }}</span>
      </div>

      <div class="products-content">
        @if (products.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p>No hay productos seleccionados</p>
          </div>
        } @else {
          <div class="products-list">
            @for (product of products; track product.productId; let i = $index) {
              <div class="product-item">
                <div class="product-info">
                  <div class="product-name">{{ product.productName }}</div>
                  <div class="product-sku">SKU: {{ product.productSku }}</div>
                </div>

                <div class="product-details">
                  <div class="detail-row">
                    <span class="detail-label">Precio unitario:</span>
                    <span class="detail-value">{{ product.unitPrice | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Cantidad:</span>
                    <span class="detail-value quantity">
                      <button
                        class="qty-btn"
                        (click)="onQuantityChange(i, product.quantity - 1)"
                        [disabled]="product.quantity <= 1 || readonly">
                        -
                      </button>
                      <span class="qty-value">{{ product.quantity }}</span>
                      <button
                        class="qty-btn"
                        (click)="onQuantityChange(i, product.quantity + 1)"
                        [disabled]="readonly">
                        +
                      </button>
                    </span>
                  </div>

                  @if (product.discount && product.discount > 0) {
                    <div class="detail-row discount">
                      <span class="detail-label">Descuento:</span>
                      <span class="detail-value">-{{ product.discount | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                  }

                  @if (product.tax && product.tax > 0) {
                    <div class="detail-row tax">
                      <span class="detail-label">Impuesto:</span>
                      <span class="detail-value">{{ product.tax | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                  }

                  <div class="detail-row total">
                    <span class="detail-label">Subtotal:</span>
                    <span class="detail-value">{{ product.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                  </div>
                </div>

                @if (!readonly) {
                  <button
                    class="remove-btn"
                    (click)="onRemoveProduct(i)"
                    title="Eliminar producto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .purchase-products-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .products-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 600;
      }
    }

    .products-content {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #9ca3af;

      .empty-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 0.938rem;
      }
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      position: relative;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .product-info {
      margin-bottom: 0.75rem;

      .product-name {
        font-weight: 600;
        color: #111827;
        font-size: 0.938rem;
        margin-bottom: 0.25rem;
      }

      .product-sku {
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;

      .detail-label {
        color: #6b7280;
        font-weight: 500;
      }

      .detail-value {
        color: #111827;
        font-weight: 600;

        &.quantity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      &.discount .detail-value {
        color: #10b981;
      }

      &.tax .detail-value {
        color: #f59e0b;
      }

      &.total {
        padding-top: 0.5rem;
        border-top: 1px solid #e5e7eb;
        margin-top: 0.25rem;

        .detail-value {
          color: #667eea;
          font-size: 1rem;
        }
      }
    }

    .qty-btn {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: 600;
      color: #374151;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .qty-value {
      min-width: 30px;
      text-align: center;
    }

    .remove-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: white;
      border: 1px solid #fca5a5;
      border-radius: 4px;
      padding: 0.375rem;
      cursor: pointer;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #fef2f2;
        border-color: #ef4444;
      }
    }
  `]
})
export class PurchaseProductsComponent {
  @Input({ required: true }) products: PurchaseItem[] = [];
  @Input() readonly: boolean = false;

  @Output() removeProduct = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<{ index: number; quantity: number }>();

  onRemoveProduct(index: number): void {
    this.removeProduct.emit(index);
  }

  onQuantityChange(index: number, quantity: number): void {
    if (quantity > 0) {
      this.quantityChange.emit({ index, quantity });
    }
  }
}
