// quotation-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuotationsService } from '../../../services/quotations/quotations.service';
import {
  CreateQuotationDto,
  CreateQuotationItemDto,
  UpdateQuotationDto,
  QuotationResponseDto,
  PAYMENT_METHOD_LABELS,
  calculateItemTotal
} from '../../../interfaces/quotation.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, Save, Plus, Trash2, LucideAngularModule } from 'lucide-angular';

interface CustomerOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './quotation-form.component.html',
  styleUrl: './quotation-form.component.scss'
})
export class QuotationFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;

  quotationForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  quotationId: string | null = null;

  // Opciones para selects
  customerOptions = signal<CustomerOption[]>([
    { value: '1', label: 'Cliente 1' },
    { value: '2', label: 'Cliente 2' },
    { value: '3', label: 'Cliente 3' }
  ]);

  paymentMethodOptions = signal<{ value: string; label: string }[]>(
    Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
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
    private quotationsService: QuotationsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quotationId = id;
      this.isEditMode.set(true);
      this.loadQuotation(id);
    } else {
      // Agregar un ítem por defecto en modo creación
      this.addItem();
    }
  }

  initForm(): void {
    const companyId = localStorage.getItem('tenant_id') || '';
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Válida por 30 días

    this.quotationForm = this.fb.group({
      companyId: [companyId, Validators.required],
      customerId: ['', Validators.required],
      issueDate: [today],
      validUntil: [validUntil.toISOString().split('T')[0], Validators.required],
      currency: ['CLP', Validators.required],
      exchangeRate: [1, [Validators.required, Validators.min(0)]],
      paymentMethod: [''],
      paymentTermsDays: [30],
      globalDiscountPercentage: [0, [Validators.min(0)]],
      globalDiscountAmount: [0, [Validators.min(0)]],
      notes: [''],
      terms: [''],
      internalNotes: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.quotationForm.get('items') as FormArray;
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.0001)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]],
      taxRate: [19, [Validators.min(0)]],
      notes: ['']
    });
  }

  addItem(): void {
    this.items.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      alert('Debe haber al menos un ítem en la cotización');
    }
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    const calc = calculateItemTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercentage,
      item.discountAmount,
      item.taxRate
    );
    return calc.lineTotal;
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
      const calc = calculateItemTotal(
        item.quantity,
        item.unitPrice,
        item.discountPercentage,
        item.discountAmount,
        item.taxRate
      );
      tax += calc.taxAmount;
    });
    return tax;
  }

  getDiscount(): number {
    let itemsDiscount = 0;
    this.items.controls.forEach((control) => {
      const item = control.value;
      const calc = calculateItemTotal(
        item.quantity,
        item.unitPrice,
        item.discountPercentage,
        item.discountAmount,
        item.taxRate
      );
      itemsDiscount += calc.discountTotal;
    });

    // Descuento global
    const globalDiscountPercentage = this.quotationForm.get('globalDiscountPercentage')?.value || 0;
    const globalDiscountAmount = this.quotationForm.get('globalDiscountAmount')?.value || 0;
    const subtotal = this.getSubtotal();

    const globalDiscount = globalDiscountPercentage > 0
      ? subtotal * (globalDiscountPercentage / 100)
      : globalDiscountAmount;

    return itemsDiscount + globalDiscount;
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getTax();
  }

  loadQuotation(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.quotationsService.getQuotationById(id).subscribe({
      next: (quotation) => {
        // Solo permitir edición si está en estado DRAFT
        if (quotation.status !== 'DRAFT') {
          alert('Solo se pueden editar cotizaciones en estado Borrador');
          this.goBack();
          return;
        }

        this.quotationForm.patchValue({
          customerId: quotation.customerId,
          issueDate: quotation.issueDate
            ? new Date(quotation.issueDate).toISOString().split('T')[0]
            : '',
          validUntil: quotation.validUntil
            ? new Date(quotation.validUntil).toISOString().split('T')[0]
            : '',
          currency: quotation.currency,
          exchangeRate: quotation.exchangeRate,
          paymentMethod: quotation.paymentMethod || '',
          paymentTermsDays: quotation.paymentTermsDays,
          globalDiscountPercentage: quotation.globalDiscountPercentage,
          globalDiscountAmount: quotation.globalDiscountAmount,
          notes: quotation.notes || '',
          terms: quotation.terms || '',
          internalNotes: quotation.internalNotes || ''
        });

        // Cargar ítems
        quotation.items.forEach(item => {
          const itemForm = this.createItemForm();
          itemForm.patchValue({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercentage: item.discountPercentage,
            discountAmount: item.discountAmount,
            taxRate: item.taxRate,
            notes: item.notes || ''
          });
          this.items.push(itemForm);
        });

        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar la cotización');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.items.length === 0) {
      alert('Debe agregar al menos un ítem a la cotización');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.quotationForm.value;
    const items: CreateQuotationItemDto[] = formValue.items.map((item: any) => ({
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      discountPercentage: parseFloat(item.discountPercentage) || 0,
      discountAmount: parseFloat(item.discountAmount) || 0,
      taxRate: parseFloat(item.taxRate) || 19,
      notes: item.notes || undefined
    }));

    if (this.isEditMode() && this.quotationId) {
      // Modo edición
      const updateDto: UpdateQuotationDto = {
        customerId: formValue.customerId,
        issueDate: formValue.issueDate || undefined,
        validUntil: formValue.validUntil,
        currency: formValue.currency,
        exchangeRate: formValue.exchangeRate,
        paymentMethod: formValue.paymentMethod || undefined,
        paymentTermsDays: formValue.paymentTermsDays || undefined,
        globalDiscountPercentage: parseFloat(formValue.globalDiscountPercentage) || 0,
        globalDiscountAmount: parseFloat(formValue.globalDiscountAmount) || 0,
        notes: formValue.notes || undefined,
        terms: formValue.terms || undefined,
        internalNotes: formValue.internalNotes || undefined,
        items
      };

      this.quotationsService.updateQuotation(this.quotationId, updateDto).subscribe({
        next: () => {
          this.router.navigate(['/quotations']);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al actualizar la cotización');
          this.loading.set(false);
        }
      });
    } else {
      // Modo creación
      const createDto: CreateQuotationDto = {
        companyId: formValue.companyId,
        customerId: formValue.customerId,
        issueDate: formValue.issueDate || undefined,
        validUntil: formValue.validUntil,
        currency: formValue.currency,
        exchangeRate: formValue.exchangeRate,
        paymentMethod: formValue.paymentMethod || undefined,
        paymentTermsDays: formValue.paymentTermsDays || undefined,
        globalDiscountPercentage: parseFloat(formValue.globalDiscountPercentage) || 0,
        globalDiscountAmount: parseFloat(formValue.globalDiscountAmount) || 0,
        notes: formValue.notes || undefined,
        terms: formValue.terms || undefined,
        internalNotes: formValue.internalNotes || undefined,
        items
      };

      this.quotationsService.createQuotation(createDto).subscribe({
        next: () => {
          this.router.navigate(['/quotations']);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al crear la cotización');
          this.loading.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/quotations']);
  }

  formatCurrency(amount: number): string {
    const currency = this.quotationForm.get('currency')?.value || 'CLP';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
}
