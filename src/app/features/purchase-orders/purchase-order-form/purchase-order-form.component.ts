// purchase-order-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseOrdersService } from '../../../services/purchase-orders/purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderItemDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderResponseDto,
  PURCHASE_ORDER_TYPE_LABELS,
  calculateItemTotal
} from '../../../interfaces/purchase-order.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, Save, Plus, Trash2, LucideAngularModule } from 'lucide-angular';

interface SupplierOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.scss'
})
export class PurchaseOrderFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;

  purchaseOrderForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  purchaseOrderId: string | null = null;

  // Opciones para selects
  supplierOptions = signal<SupplierOption[]>([
    { value: '1', label: 'Proveedor 1' },
    { value: '2', label: 'Proveedor 2' },
    { value: '3', label: 'Proveedor 3' }
  ]);

  typeOptions = signal<{ value: string; label: string }[]>(
    Object.entries(PURCHASE_ORDER_TYPE_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  );

  currencyOptions = signal<{ value: string; label: string }[]>([
    { value: 'CLP', label: 'Peso Chileno (CLP)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ]);

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
    text: 'Guardar',
    iconPosition: 'left'
  };

  addItemButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'sm',
    icon: this.PlusIcon,
    text: 'Agregar Ítem',
    iconPosition: 'left'
  };

  constructor(
    private fb: FormBuilder,
    private purchaseOrdersService: PurchaseOrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.purchaseOrderId = id;
      this.isEditMode.set(true);
      this.loadPurchaseOrder(id);
    } else {
      // Agregar un ítem por defecto en modo creación
      this.addItem();
    }
  }

  initForm(): void {
    this.purchaseOrderForm = this.fb.group({
      supplierId: ['', Validators.required],
      type: ['STANDARD', Validators.required],
      currency: ['CLP', Validators.required],
      expectedDeliveryDate: [''],
      notes: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.purchaseOrderForm.get('items') as FormArray;
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxPercentage: [19, [Validators.min(0), Validators.max(100)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      alert('Debe haber al menos un ítem en la orden');
    }
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    return calculateItemTotal(item.quantity, item.unitPrice, item.taxPercentage);
  }

  getSubtotal(): number {
    let subtotal = 0;
    this.items.controls.forEach((control) => {
      const item = control.value;
      subtotal += item.quantity * item.unitPrice;
    });
    return subtotal;
  }

  getTax(): number {
    let tax = 0;
    this.items.controls.forEach((control) => {
      const item = control.value;
      const itemSubtotal = item.quantity * item.unitPrice;
      tax += itemSubtotal * ((item.taxPercentage || 0) / 100);
    });
    return tax;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.purchaseOrdersService.getPurchaseOrderById(id).subscribe({
      next: (response) => {
        const purchaseOrder = response.data;

        // Solo permitir edición si está en estado DRAFT
        if (!purchaseOrder.canBeEdited) {
          alert('Solo se pueden editar órdenes en estado Borrador');
          this.goBack();
          return;
        }

        this.purchaseOrderForm.patchValue({
          supplierId: purchaseOrder.supplierId,
          type: purchaseOrder.type,
          currency: purchaseOrder.currency,
          expectedDeliveryDate: purchaseOrder.expectedDeliveryDate
            ? new Date(purchaseOrder.expectedDeliveryDate).toISOString().split('T')[0]
            : '',
          notes: purchaseOrder.notes || ''
        });

        // Cargar ítems
        purchaseOrder.items.forEach(item => {
          const itemForm = this.createItemForm();
          itemForm.patchValue({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxPercentage: item.taxPercentage
          });
          this.items.push(itemForm);
        });

        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la orden de compra');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.items.length === 0) {
      alert('Debe agregar al menos un ítem a la orden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.purchaseOrderForm.value;
    const items: CreatePurchaseOrderItemDto[] = formValue.items.map((item: any) => ({
      name: item.name,
      description: item.description || undefined,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      taxPercentage: parseFloat(item.taxPercentage) || 0
    }));

    if (this.isEditMode() && this.purchaseOrderId) {
      // Modo edición
      const updateDto: UpdatePurchaseOrderDto = {
        supplierId: formValue.supplierId,
        type: formValue.type,
        currency: formValue.currency,
        expectedDeliveryDate: formValue.expectedDeliveryDate || undefined,
        notes: formValue.notes || undefined
      };

      this.purchaseOrdersService.updatePurchaseOrder(this.purchaseOrderId, updateDto).subscribe({
        next: () => {
          this.router.navigate(['/purchase-orders']);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al actualizar la orden de compra');
          this.loading.set(false);
        }
      });
    } else {
      // Modo creación
      const createDto: CreatePurchaseOrderDto = {
        supplierId: formValue.supplierId,
        type: formValue.type,
        currency: formValue.currency,
        expectedDeliveryDate: formValue.expectedDeliveryDate || undefined,
        notes: formValue.notes || undefined,
        items
      };

      this.purchaseOrdersService.createPurchaseOrder(createDto).subscribe({
        next: () => {
          this.router.navigate(['/purchase-orders']);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al crear la orden de compra');
          this.loading.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/purchase-orders']);
  }

  formatCurrency(amount: number): string {
    const currency = this.purchaseOrderForm.get('currency')?.value || 'CLP';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
}
