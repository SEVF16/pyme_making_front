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
  templateUrl: './purchase-products.component.html',

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
