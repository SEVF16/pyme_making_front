import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseSummaryComponent } from './purchase-summary.component';
import { Purchase, PurchaseItem, PaymentMethod, PurchaseChangeEvent } from '../../interfaces/purchase/purchase.interfaces';

/**
 * Componente de ejemplo que demuestra el uso de PurchaseSummaryComponent
 *
 * Este componente muestra cómo:
 * - Inicializar una compra con productos
 * - Proporcionar métodos de pago
 * - Manejar eventos de cambio y guardado
 * - Usar diferentes layouts (horizontal/vertical)
 */
@Component({
  selector: 'app-purchase-example',
  standalone: true,
  imports: [CommonModule, PurchaseSummaryComponent],
  templateUrl: './purchase-example.component.html',
})
export class PurchaseExampleComponent implements OnInit {
  // Estado del layout
  layout = signal<'horizontal' | 'vertical'>('horizontal');

  // Eventos capturados
  events = signal<Array<{ time: string; type: string; message: string }>>([]);

  // Datos de ejemplo
  initialPurchase: Purchase = {
    items: [
      {
        productId: 'prod-001',
        productName: 'Laptop HP ProBook 450',
        productSku: 'HP-PB450-001',
        quantity: 2,
        unitPrice: 850000,
        subtotal: 1700000,
        discount: 50000,
        tax: 0,
        total: 1650000
      },
      {
        productId: 'prod-002',
        productName: 'Mouse Logitech MX Master 3',
        productSku: 'LOG-MXM3-BLK',
        quantity: 3,
        unitPrice: 85000,
        subtotal: 255000,
        discount: 0,
        tax: 0,
        total: 255000
      },
      {
        productId: 'prod-003',
        productName: 'Teclado Mecánico Keychron K8',
        productSku: 'KEY-K8-RGB',
        quantity: 2,
        unitPrice: 120000,
        subtotal: 240000,
        discount: 20000,
        tax: 0,
        total: 220000
      }
    ],
    subtotal: 2195000,
    totalDiscount: 70000,
    totalTax: 0,
    total: 2125000,
    status: 'draft',
    companyId: 'company-001',
    purchaseNumber: 'PO-2024-001'
  };

  paymentMethods: PaymentMethod[] = [
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

  ngOnInit(): void {
    this.addEvent('info', 'Componente inicializado con datos de ejemplo');
  }

  /**
   * Maneja los cambios en la compra
   */
  onPurchaseChange(event: PurchaseChangeEvent): void {
    const message = event.isValid
      ? `Compra actualizada - Total: ${this.formatCurrency(event.purchase.total)} (${event.purchase.items.length} productos)`
      : `Compra actualizada - INVÁLIDA`;

    this.addEvent('change', message);

    console.log('Purchase changed:', {
      purchase: event.purchase,
      isValid: event.isValid
    });
  }

  /**
   * Maneja el guardado de la compra
   */
  onSave(purchase: Purchase): void {
    const message = `Compra guardada - ${purchase.purchaseNumber || 'Sin número'} - Total: ${this.formatCurrency(purchase.total)}`;
    this.addEvent('save', message);

    console.log('Save purchase:', purchase);

    // Aquí normalmente harías la llamada al servicio para guardar la compra
    // this.purchaseService.create(purchase).subscribe(...)
  }

  /**
   * Maneja la limpieza de la compra
   */
  onClear(): void {
    this.addEvent('clear', 'Compra limpiada');
    console.log('Purchase cleared');
  }

  /**
   * Agrega un evento al log
   */
  private addEvent(type: string, message: string): void {
    const time = new Date().toLocaleTimeString();
    const newEvents = [{ time, type, message }, ...this.events()];

    // Mantener solo los últimos 10 eventos
    if (newEvents.length > 10) {
      newEvents.pop();
    }

    this.events.set(newEvents);
  }

  /**
   * Formatea un número como moneda chilena
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
