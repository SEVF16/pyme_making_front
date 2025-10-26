import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Option, SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { MessageService } from 'primeng/api';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MaskConfig } from '../../../shared/components/input/interfaces/mask-config.interface';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';
import { ICreateCustomerDto, ICustomer } from '../../../interfaces/customers/customers.interfaces';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [InputComponent, SelectLibComponent],
  providers: [MessageService],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public rutMask: MaskConfig  = {
  mask: '00.000.000-0',
  // dropSpecialCharacters: ['.',], // Solo remover puntos
  specialCharacters: ['.', '-']
};
  public phoneMask: MaskConfig = {
    mask: '00000000',
    dropSpecialCharacters: true,
    prefix: '+56 9 '
  };
  customerForm!: FormGroup;
  customerTypes : Option[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Empresa' },
    { value: 'government', label: 'Gobierno' }
  ];

  public regions : Option[]= [
    { value: 'metropolitana', label: 'Región Metropolitana' },
    { value: 'valparaiso', label: 'Valparaíso' }
  ];
  uploadedFiles: any[] = [];
  customer = input<ICustomer | null>(null);
  customerEventChange = output<DataChangeEvent<ICreateCustomerDto>>();
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.initializeForm();
    console.log("inic");
        if (this.customer()) {
      this.populateForm(this.customer()!);
    }
  }
    initializeForm(): void {
    this.customerForm = this.fb.group({
      rut: [{ value: '', disabled: this.customer()?.rut ? true : false  }, [Validators.required]],
      firstName: [{ value: '', disabled: this.customer()?.firstName ? true : false  }, [Validators.required, Validators.minLength(2)]],
      lastName: [{ value: '', disabled: this.customer()?.lastName ? true : false  }, [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]+$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      postalCode: ['', []],
      customerType: [{ value: '', disabled: this.customer()?.customerType ? true : false  }, Validators.required],
      companyId: ['', ],
      birthDate: [{ value: '', disabled: this.customer()?.birthDate ? true : false  }],
      website: ['', Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)],
      additionalInfo: this.fb.group({})
    });
    this.setupFormListener();

  }

  private setupFormListener(): void {
  this.customerForm.valueChanges
    .pipe(
      debounceTime(300)
    )
    .subscribe(() => {
      const dto = this.mapFormToDto();
      this.customerEventChange.emit({
        data: dto,
        isValid: this.customerForm.valid
      });
    });
  }
 private populateForm(customer: ICustomer): void {
    this.customerForm.patchValue({
      rut: customer.rut,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      region: customer.region,
      postalCode: customer.postalCode,
      customerType: customer.customerType,
      companyId: customer.companyId,
      birthDate: customer.birthDate ? this.formatDateForInput(customer.birthDate) : '',
      website: customer.website || '',
    });

  }

  // ✅ Método para formatear fecha para input
  private formatDateForInput(date: string | Date): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
private mapFormToDto(): ICreateCustomerDto {
  const formValue = this.customerForm.getRawValue();

  const dto: ICreateCustomerDto = {
    rut: formValue.rut.trim(),
    firstName: formValue.firstName.trim(),
    lastName: formValue.lastName.trim(),
    email: formValue.email.trim(),
    phone: formValue.phone.trim(),
    address: formValue.address.trim(),
    city: formValue.city.trim(),
    region: formValue.region,
    postalCode: formValue.postalCode.trim(),
    customerType: formValue.customerType,
    companyId: formValue.companyId.trim(),
  //  status: 'active', // Valor por defecto según tu modelo
    birthDate: formValue.birthDate || undefined,
    website: formValue.website?.trim() || undefined,
    additionalInfo: formValue.additionalInfo || undefined
  };

  return dto;
}
}
