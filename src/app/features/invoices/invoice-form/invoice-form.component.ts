// invoice-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoicesService } from '../../../services/invoices/invoices.service';
import {
  CreateInvoiceDto,
  InvoiceType,
  PaymentMethod,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../interfaces/invoice.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectLibComponent, Option } from '../../../shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { Save, X, Plus, Trash2, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent implements OnInit {
  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;

  invoiceForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEditMode = false;
  invoiceId: string | null = null;

  // Options para selects
  invoiceTypeOptions: Option[] = Object.entries(INVOICE_TYPE_LABELS).map(([value, label]) => ({
    label,
    value
  }));

  paymentMethodOptions: Option[] = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    label,
    value
  }));

  // Botones
  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Guardar Factura',
    iconPosition: 'left',
    type: 'submit'
  };

  cancelButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.XIcon,
    text: 'Cancelar',
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
    private invoicesService: InvoicesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.checkEditMode();
  }

  createForm(): void {
    this.invoiceForm = this.fb.group({
      type: ['sale', Validators.required],
      customerId: [''],
      customerData: this.fb.group({
        name: ['', Validators.required],
        rut: [''],
        email: ['', Validators.email],
        phone: [''],
        address: ['']
      }),
      issueDate: [this.getTodayDate(), Validators.required],
      dueDate: [''],
      paymentMethod: ['transfer', Validators.required],
      terms: [''],
      notes: [''],
      globalDiscountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      globalDiscountAmount: [0, Validators.min(0)],
      items: this.fb.array([this.createItemForm()])
    });
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      productId: [''],
      productSku: [''],
      name: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      discountAmount: [0, Validators.min(0)],
      taxPercentage: [19, [Validators.min(0), Validators.max(100)]],
      unit: ['unidad']
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      alert('Debe haber al menos un ítem en la factura');
    }
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.invoiceId = id;
      this.loadInvoice(id);
    }
  }

  loadInvoice(id: string): void {
    this.loading.set(true);
    this.invoicesService.getInvoiceById(id).subscribe({
      next: (response) => {
        const invoice = response.data;
        this.invoiceForm.patchValue({
          type: invoice.type,
          customerId: invoice.customerId,
          customerData: invoice.customerData,
          issueDate: this.formatDateForInput(invoice.issueDate),
          dueDate: invoice.dueDate ? this.formatDateForInput(invoice.dueDate) : '',
          paymentMethod: invoice.paymentMethod,
          terms: invoice.terms,
          notes: invoice.notes,
          globalDiscountPercentage: invoice.globalDiscountPercentage,
          globalDiscountAmount: invoice.globalDiscountAmount
        });

        // Cargar ítems
        this.items.clear();
        invoice.items.forEach(item => {
          this.items.push(this.fb.group({
            productId: [item.productId || ''],
            productSku: [item.productSku || ''],
            name: [item.name, Validators.required],
            description: [item.description || ''],
            quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
            discountPercentage: [item.discountPercentage, [Validators.min(0), Validators.max(100)]],
            discountAmount: [item.discountAmount, Validators.min(0)],
            taxPercentage: [item.taxPercentage, [Validators.min(0), Validators.max(100)]],
            unit: [item.unit || 'unidad']
          }));
        });

        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la factura');
        this.loading.set(false);
        console.error('Error loading invoice:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.error.set('Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const companyId = localStorage.getItem('tenant_id')!;
    const formValue = this.invoiceForm.value;

    const invoice: CreateInvoiceDto = {
      ...formValue,
      companyId
    };

    if (this.isEditMode && this.invoiceId) {
      // Actualizar factura
      this.invoicesService.updateInvoice(this.invoiceId, formValue).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.router.navigate(['/invoices', response.data.id]);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al actualizar factura');
          this.loading.set(false);
        }
      });
    } else {
      // Crear nueva factura
      this.invoicesService.createInvoice(invoice).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.router.navigate(['/invoices', response.data.id]);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al crear factura');
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/invoices']);
  }

  // ===== UTILIDADES =====

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
