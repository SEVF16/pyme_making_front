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
  templateUrl: './purchase-total.component.html',
})
export class PurchaseTotalComponent {
  @Input({ required: true }) subtotal: number = 0;
  @Input() totalDiscount: number = 0;
  @Input() totalTax: number = 0;
  @Input({ required: true }) total: number = 0;
  @Input() itemsCount: number = 0;
  @Input() totalQuantity: number = 0;
}
