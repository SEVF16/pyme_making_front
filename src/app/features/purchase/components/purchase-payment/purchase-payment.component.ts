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
  templateUrl: './purchase-payment.component.html',
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
