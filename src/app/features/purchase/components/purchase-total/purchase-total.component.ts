import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

/**
 * Componente Dumb/Presentacional para mostrar el total de la compra
 *
 * Responsabilidades:
 * - Recibe datos de totales via @Input
 * - Muestra subtotal, descuentos, impuestos y total
 * - No maneja logica de negocio
 * - Usa OnPush para optimizar rendimiento
 */
@Component({
  selector: 'app-purchase-total',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="purchase-total-card">
      <div class="total-header">
        <h3>Resumen de Compra</h3>
      </div>

      <div class="total-content">
        <div class="total-row">
          <span class="label">Subtotal:</span>
          <span class="value">{{ subtotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
        </div>

        @if (totalDiscount > 0) {
          <div class="total-row discount">
            <span class="label">Descuentos:</span>
            <span class="value">-{{ totalDiscount | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
          </div>
        }

        @if (totalTax > 0) {
          <div class="total-row tax">
            <span class="label">Impuestos:</span>
            <span class="value">{{ totalTax | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
          </div>
        }

        <div class="divider"></div>

        <div class="total-row total">
          <span class="label">Total:</span>
          <span class="value">{{ total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
        </div>

        <div class="total-row items-count">
          <span class="label">Items:</span>
          <span class="value">{{ itemsCount }}</span>
        </div>

        @if (totalQuantity > 0) {
          <div class="total-row quantity">
            <span class="label">Cantidad total:</span>
            <span class="value">{{ totalQuantity }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .purchase-total-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .total-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .total-content {
      padding: 1.5rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.938rem;

      .label {
        color: #6b7280;
        font-weight: 500;
      }

      .value {
        color: #111827;
        font-weight: 600;
      }

      &.discount {
        .value {
          color: #10b981;
        }
      }

      &.tax {
        .value {
          color: #f59e0b;
        }
      }

      &.total {
        font-size: 1.25rem;
        margin-top: 0.5rem;

        .label {
          color: #111827;
          font-weight: 700;
        }

        .value {
          color: #667eea;
          font-weight: 700;
        }
      }

      &.items-count,
      &.quantity {
        font-size: 0.875rem;
        padding: 0.25rem 0;
      }
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.75rem 0;
    }
  `]
})
export class PurchaseTotalComponent {
  @Input({ required: true }) subtotal: number = 0;
  @Input() totalDiscount: number = 0;
  @Input() totalTax: number = 0;
  @Input({ required: true }) total: number = 0;
  @Input() itemsCount: number = 0;
  @Input() totalQuantity: number = 0;
}
