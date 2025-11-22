import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { POSSalesService } from '../../../services/pos/pos-sales.service';
import { POSSessionsService } from '../../../services/pos/pos-sessions.service';
import {
  CreatePOSSaleDto,
  CreatePOSSaleItemDto,
  POSPaymentMethod,
  POS_PAYMENT_METHOD_LABELS,
  calculateSaleTotal
} from '../../../interfaces/pos.interfaces';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, Plus, Trash2, Save, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pos-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-sale-form.component.html',
  styleUrl: './pos-sale-form.component.scss'
})
export class POSSaleFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly SaveIcon = Save;

  saleForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  sessionId = signal<string | null>(null);

  paymentMethods = [
    { value: POSPaymentMethod.CASH, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.CASH] },
    { value: POSPaymentMethod.CARD, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.CARD] },
    { value: POSPaymentMethod.TRANSFER, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.TRANSFER] },
    { value: POSPaymentMethod.OTHER, label: POS_PAYMENT_METHOD_LABELS[POSPaymentMethod.OTHER] }
  ];

  backButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.ArrowLeftIcon,
    text: 'Volver',
    iconPosition: 'left'
  };

  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Crear y Completar Venta',
    iconPosition: 'left'
  };

  // Totales calculados
  totals = computed(() => {
    if (!this.saleForm) {
      return { subtotal: 0, discountTotal: 0, taxTotal: 0, total: 0 };
    }

    const items = this.items.value as CreatePOSSaleItemDto[];
    return calculateSaleTotal(items);
  });

  change = computed(() => {
    const amountReceived = this.saleForm?.get('amountReceived')?.value || 0;
    const total = this.totals().total;
    return Math.max(0, amountReceived - total);
  });

  constructor(
    private fb: FormBuilder,
    private salesService: POSSalesService,
    private sessionsService: POSSessionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentSession();
    this.initForm();
  }

  loadCurrentSession(): void {
    // Intentar obtener la sesión abierta actual
    this.sessionsService.getOpenSessions().subscribe({
      next: (sessions) => {
        if (sessions.length > 0) {
          this.sessionId.set(sessions[0].id);
        }
      },
      error: () => {
        // Sesión no encontrada, continuar sin sesión
      }
    });
  }

  initForm(): void {
    this.saleForm = this.fb.group({
      companyId: [localStorage.getItem('tenant_id'), Validators.required],
      sessionId: [null],
      paymentMethod: [POSPaymentMethod.CASH, Validators.required],
      amountReceived: [0, [Validators.required, Validators.min(0)]],
      transactionReference: [''],
      notes: [''],
      cashierId: [localStorage.getItem('user_id')],
      cashierName: [localStorage.getItem('user_name')],
      items: this.fb.array([], Validators.required)
    });

    // Agregar un item inicial
    this.addItem();
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: [null],
      description: ['', Validators.required],
      sku: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      discountAmount: [0, Validators.min(0)],
      taxRate: [19, Validators.required],
      notes: ['']
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  getItemDiscount(index: number): number {
    const item = this.items.at(index);
    const subtotal = this.getItemSubtotal(index);
    const discountPercentage = item.get('discountPercentage')?.value || 0;
    const discountAmount = item.get('discountAmount')?.value || 0;

    if (discountPercentage > 0) {
      return subtotal * (discountPercentage / 100);
    }
    return discountAmount;
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const subtotal = this.getItemSubtotal(index);
    const discount = this.getItemDiscount(index);
    const taxRate = item.get('taxRate')?.value || 0;

    const neto = subtotal - discount;
    const tax = neto * (taxRate / 100);

    return neto + tax;
  }

  goBack(): void {
    this.router.navigate(['/pos/sales']);
  }

  createSale(): void {
    if (this.saleForm.invalid) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    const total = this.totals().total;
    const amountReceived = this.saleForm.get('amountReceived')?.value;

    if (amountReceived < total) {
      this.error.set(`Monto insuficiente. Total: ${this.formatCurrency(total)}, Recibido: ${this.formatCurrency(amountReceived)}`);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.saleForm.value;

    // Agregar sessionId si existe
    if (this.sessionId()) {
      formValue.sessionId = this.sessionId();
    }

    const createDto: CreatePOSSaleDto = formValue;

    this.salesService.create(createDto).subscribe({
      next: (sale) => {
        // Completar la venta automáticamente
        this.salesService.completeSale(sale.id, {
          amountReceived,
          cashierId: formValue.cashierId,
          cashierName: formValue.cashierName
        }).subscribe({
          next: (completedSale) => {
            this.loading.set(false);
            this.router.navigate(['/pos/sales', completedSale.id]);
          },
          error: (error) => {
            this.loading.set(false);
            this.error.set(error.message || 'Error al completar la venta');
          }
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al crear la venta');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
