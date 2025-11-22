// payment-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentsService } from '../../../services/payments/payments.service';
import {
  CreatePaymentDto,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../interfaces/payment.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectLibComponent, Option } from '../../../shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { Save, X, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss'
})
export class PaymentFormComponent implements OnInit {
  readonly SaveIcon = Save;
  readonly XIcon = X;

  paymentForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEditMode = false;
  paymentId: string | null = null;

  // Options para selects
  typeOptions: Option[] = Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => ({
    label,
    value
  }));

  methodOptions: Option[] = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    label,
    value
  }));

  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Guardar Pago',
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

  constructor(
    private fb: FormBuilder,
    private paymentsService: PaymentsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.checkEditMode();
  }

  createForm(): void {
    const companyId = localStorage.getItem('tenant_id') || '';
    const today = new Date().toISOString().split('T')[0];

    this.paymentForm = this.fb.group({
      companyId: [companyId, Validators.required],
      type: ['INBOUND', Validators.required],
      paymentMethod: ['BANK_TRANSFER', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['CLP'],
      exchangeRate: [1, Validators.min(0)],
      paymentDate: [today, Validators.required],
      invoiceId: [''],
      purchaseOrderId: [''],
      transactionReference: [''],
      notes: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.paymentId = id;
      this.loadPayment(id);
    }
  }

  loadPayment(id: string): void {
    this.loading.set(true);
    this.paymentsService.getPaymentById(id).subscribe({
      next: (response) => {
        const payment = response.data;
        this.paymentForm.patchValue({
          type: payment.type,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          currency: payment.currency,
          exchangeRate: payment.exchangeRate,
          paymentDate: this.formatDateForInput(payment.paymentDate),
          invoiceId: payment.invoiceId,
          purchaseOrderId: payment.purchaseOrderId,
          transactionReference: payment.transactionReference,
          notes: payment.notes
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el pago');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.error.set('Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const paymentData: CreatePaymentDto = this.paymentForm.value;

    if (this.isEditMode && this.paymentId) {
      this.paymentsService.updatePayment(this.paymentId, paymentData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.router.navigate(['/payments', response.data.id]);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al actualizar pago');
          this.loading.set(false);
        }
      });
    } else {
      this.paymentsService.createPayment(paymentData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.router.navigate(['/payments', response.data.id]);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al crear pago');
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
