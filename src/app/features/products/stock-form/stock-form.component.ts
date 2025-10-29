import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Option, SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { CommonModule } from '@angular/common';
import {   UpdateStockDto } from '../../../interfaces/product.interfaces';
import { debounceTime } from 'rxjs';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [InputComponent, SelectLibComponent, CommonModule],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.scss'
})
export class StockFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  /**
   * Input property to receive product ID for stock management
   * When provided, the form will be associated with this product
   */
  productId = input<string | null>(null);

  /**
   * Input property to receive existing stock data for editing
   * When provided, the form will auto-populate with the stock values
   */
  stockData = input< UpdateStockDto  | null>(null);

  stockForm!: FormGroup;

  /**
   * Movement type options for the select dropdown
   */
  movementTypeOptions: Option[] = [
    { label: 'Entrada', value: 'in' },
    { label: 'Salida', value: 'out' },
    { label: 'Ajuste', value: 'adjustment' }
  ];

  /**
   * Output events for form actions
   */
  stockChange = output<DataChangeEvent<UpdateStockDto>>();
  save = output<UpdateStockDto>();
  cancel = output<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListener();

    // Populate form if initial data is provided
    const initialData = this.stockData();
    if (initialData) {
      this.populateForm(initialData);
    }
  }

  /**
   * Initializes the reactive form with validation rules
   */
  private initializeForm(): void {
    this.stockForm = this.fb.group({
      quantity: [0, [Validators.required, Validators.min(-1000), Validators.max(1000)]],
      movementType: ['in', Validators.required],
      reason: ['', [Validators.maxLength(200)]],
      reference: ['', [Validators.maxLength(50)]]
    });
  }

  /**
   * Sets up a listener for form value changes
   * Emits stockChange event with debounced form data
   */
  private setupFormListener(): void {
    this.stockForm.valueChanges
      .pipe(
        debounceTime(300)
      )
      .subscribe(() => {
        const dto = this.mapFormToDto();
        this.stockChange.emit({
          data: dto,
          isValid: this.stockForm.valid
        });
      });
  }

  /**
   * Maps form values to UpdateStockDto
   * Performs data transformation and validation
   */
  private mapFormToDto(): UpdateStockDto {
    const formValue = this.stockForm.getRawValue();

    const dto: UpdateStockDto = {
      quantity: Number(formValue.quantity),
      movementType: formValue.movementType,
      reason: formValue.reason?.trim() || undefined,
      reference: formValue.reference?.trim() || undefined
    };

    return dto;
  }

  /**
   * Populates the form with stock data
   * Used for edit mode when stockData input is provided
   */
  populateForm(data: UpdateStockDto): void {
    if (!this.stockForm) {
      return;
    }

    this.stockForm.patchValue({
      quantity: data.quantity ?? 0,
      movementType: data.movementType || 'in',
      reason: data.reason || '',
      reference: data.reference || ''
    }, { emitEvent: false });

    // Manually trigger validation and emit the current state
    this.stockForm.updateValueAndValidity();

    // Emit the initial state
    const dto = this.mapFormToDto();
    this.stockChange.emit({
      data: dto,
      isValid: this.stockForm.valid
    });
  }

  /**
   * Handles the save button click
   * Validates form and emits save event with stock data
   */
  onSave(): void {
    if (this.stockForm.valid) {
      const dto = this.mapFormToDto();
      this.save.emit(dto);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.stockForm.controls).forEach(key => {
        this.stockForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handles the cancel button click
   * Emits cancel event and optionally resets the form
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Resets the form to initial state
   */
  resetForm(): void {
    this.stockForm.reset({
      quantity: 0,
      movementType: 'in',
      reason: '',
      reference: ''
    });
  }

  /**
   * Checks if the form has been modified
   */
  get isDirty(): boolean {
    return this.stockForm.dirty;
  }

  /**
   * Checks if the form is valid
   */
  get isValid(): boolean {
    return this.stockForm.valid;
  }

  /**
   * Helper method to determine if quantity should be positive based on movement type
   */
  get shouldQuantityBePositive(): boolean {
    const movementType = this.stockForm.get('movementType')?.value;
    return movementType === 'in';
  }

  /**
   * Helper method to determine if quantity should be negative based on movement type
   */
  get shouldQuantityBeNegative(): boolean {
    const movementType = this.stockForm.get('movementType')?.value;
    return movementType === 'out';
  }

  /**
   * Updates quantity validation based on movement type
   */
  updateQuantityValidation(): void {
    const movementType = this.stockForm.get('movementType')?.value;
    const quantityControl = this.stockForm.get('quantity');
    
    if (movementType === 'in') {
      quantityControl?.setValidators([Validators.required, Validators.min(1), Validators.max(1000)]);
    } else if (movementType === 'out') {
      quantityControl?.setValidators([Validators.required, Validators.max(-1), Validators.min(-1000)]);
    } else {
      // adjustment - can be positive or negative
      quantityControl?.setValidators([Validators.required, Validators.min(-1000), Validators.max(1000)]);
    }
    
    quantityControl?.updateValueAndValidity();
  }
}
