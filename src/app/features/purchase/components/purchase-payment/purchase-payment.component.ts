import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod, PaymentMethodType } from '../../../../interfaces/purchase/purchase.interfaces';

/**
 * Componente Dumb/Presentacional para mostrar y seleccionar metodo de pago
 *
 * Responsabilidades:
 * - Recibe metodos de pago disponibles y seleccionado via @Input
 * - Emite eventos de seleccion
 * - Solo logica de presentacion
 * - Usa OnPush para optimizar rendimiento
 */
@Component({
  selector: 'app-purchase-payment',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="purchase-payment-card">
      <div class="payment-header">
        <h3>Metodo de Pago</h3>
      </div>

      <div class="payment-content">
        @if (paymentMethods.length === 0) {
          <div class="empty-state">
            <p>No hay metodos de pago disponibles</p>
          </div>
        } @else {
          <div class="payment-options">
            @for (method of paymentMethods; track method.id) {
              <div
                class="payment-option"
                [class.selected]="selectedPaymentMethodId === method.id"
                [class.disabled]="!method.isActive || readonly"
                (click)="onSelectPaymentMethod(method)">
                <div class="option-icon">
                  @switch (method.type) {
                    @case ('cash') {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    }
                    @case ('credit_card') {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    }
                    @case ('debit_card') {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    }
                    @case ('transfer') {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    }
                    @case ('check') {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    }
                    @default {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    }
                  }
                </div>

                <div class="option-info">
                  <div class="option-name">{{ method.name }}</div>
                  @if (method.description) {
                    <div class="option-description">{{ method.description }}</div>
                  }
                </div>

                @if (selectedPaymentMethodId === method.id) {
                  <div class="option-check">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (selectedPaymentMethod) {
          <div class="selected-payment-summary">
            <div class="summary-label">Metodo seleccionado:</div>
            <div class="summary-value">
              <span class="payment-type-badge" [attr.data-type]="selectedPaymentMethod.type">
                {{ getPaymentTypeLabel(selectedPaymentMethod.type) }}
              </span>
              <span class="payment-name">{{ selectedPaymentMethod.name }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .purchase-payment-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .payment-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .payment-content {
      padding: 1.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: #9ca3af;

      p {
        margin: 0;
        font-size: 0.938rem;
      }
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;

      &:hover:not(.disabled) {
        border-color: #667eea;
        background: #f9fafb;
      }

      &.selected {
        border-color: #667eea;
        background: #eef2ff;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .option-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 8px;
      color: #667eea;

      .selected & {
        background: #667eea;
        color: white;
      }
    }

    .option-info {
      flex: 1;

      .option-name {
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.25rem;
      }

      .option-description {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .option-check {
      flex-shrink: 0;
      color: #10b981;
    }

    .selected-payment-summary {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;

      .summary-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .summary-value {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .payment-type-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        background: #e5e7eb;
        color: #374151;

        &[data-type="cash"] {
          background: #d1fae5;
          color: #065f46;
        }

        &[data-type="credit_card"],
        &[data-type="debit_card"] {
          background: #dbeafe;
          color: #1e40af;
        }

        &[data-type="transfer"] {
          background: #fef3c7;
          color: #92400e;
        }

        &[data-type="check"] {
          background: #e0e7ff;
          color: #3730a3;
        }
      }

      .payment-name {
        font-weight: 600;
        color: #111827;
      }
    }
  `]
})
export class PurchasePaymentComponent {
  @Input({ required: true }) paymentMethods: PaymentMethod[] = [];
  @Input() selectedPaymentMethodId?: string;
  @Input() selectedPaymentMethod?: PaymentMethod;
  @Input() readonly: boolean = false;

  @Output() paymentMethodSelect = new EventEmitter<PaymentMethod>();

  onSelectPaymentMethod(method: PaymentMethod): void {
    if (method.isActive && !this.readonly) {
      this.paymentMethodSelect.emit(method);
    }
  }

  getPaymentTypeLabel(type: PaymentMethodType): string {
    const labels: Record<PaymentMethodType, string> = {
      cash: 'Efectivo',
      credit_card: 'Tarjeta Credito',
      debit_card: 'Tarjeta Debito',
      transfer: 'Transferencia',
      check: 'Cheque',
      other: 'Otro'
    };
    return labels[type] || type;
  }
}
