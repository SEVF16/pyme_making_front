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
  template: `
    <div class="example-container">
      <div class="example-header">
        <h1>Ejemplo de Resumen de Compra</h1>
        <div class="layout-controls">
          <button
            class="layout-btn"
            [class.active]="layout() === 'horizontal'"
            (click)="layout.set('horizontal')">
            Horizontal
          </button>
          <button
            class="layout-btn"
            [class.active]="layout() === 'vertical'"
            (click)="layout.set('vertical')">
            Vertical
          </button>
        </div>
      </div>

      <div class="example-content">
        <app-purchase-summary
          [initialPurchase]="initialPurchase"
          [paymentMethods]="paymentMethods"
          [layout]="layout()"
          [showActions]="true"
          [showValidationStatus]="true"
          saveButtonLabel="Completar Compra"
          (purchaseChange)="onPurchaseChange($event)"
          (save)="onSave($event)"
          (clear)="onClear()"
        />
      </div>

      <!-- Panel de información de eventos -->
      <div class="events-panel">
        <h3>Eventos</h3>
        <div class="event-log">
          @for (event of events(); track $index) {
            <div class="event-item" [class]="event.type">
              <span class="event-time">{{ event.time }}</span>
              <span class="event-type">{{ event.type }}</span>
              <span class="event-message">{{ event.message }}</span>
            </div>
          }
          @if (events().length === 0) {
            <div class="no-events">No hay eventos aún</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .example-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        margin: 0;
        font-size: 2rem;
        color: #111827;
      }
    }

    .layout-controls {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.25rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .layout-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
      }

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }

    .example-content {
      margin-bottom: 2rem;
      min-height: 600px;
    }

    .events-panel {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h3 {
        margin: 0 0 1rem 0;
        color: #111827;
        font-size: 1.25rem;
      }
    }

    .event-log {
      max-height: 300px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .event-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      border-left: 3px solid transparent;

      &.change {
        background: #eff6ff;
        border-left-color: #3b82f6;
      }

      &.save {
        background: #f0fdf4;
        border-left-color: #10b981;
      }

      &.clear {
        background: #fef2f2;
        border-left-color: #ef4444;
      }

      .event-time {
        color: #6b7280;
        font-weight: 500;
      }

      .event-type {
        color: #374151;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
      }

      .event-message {
        color: #111827;
        flex: 1;
      }
    }

    .no-events {
      text-align: center;
      color: #9ca3af;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .example-container {
        padding: 1rem;
      }

      .example-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
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
