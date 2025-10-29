import { Component, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Option, SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { CreateProductDto, Product } from '../../../interfaces/product.interfaces';
import { debounceTime, filter, startWith, tap } from 'rxjs';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';


interface UploadEvent {
    originalEvent: Event;
    files: File[];
}
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [InputComponent, SelectLibComponent, FileUploadModule, ToastModule, CommonModule],
     providers: [MessageService],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);

  /**
   * Input property to receive product data for editing
   * When provided, the form will auto-populate with the product values
   */
  productData = input<Product | CreateProductDto | null>(null);

  productForm!: FormGroup;
  categories: Option[] = [
    { label: 'Electrónicos', value: 'electronics' },
    { label: 'Ropa', value: 'clothing' },
    { label: 'Ropa', value: 'clothing' }
  ];
  uploadedFiles: any[] = [];
  productChange = output<DataChangeEvent<CreateProductDto>>();

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListener();

    // Populate form if initial data is provided
    const initialData = this.productData();
    console.log(this.productData());
    if (initialData) {
      this.populateForm(initialData);
    }
  }


  onUpload(event:any) {
      for(let file of event.files) {
          this.uploadedFiles.push(file);
      }

      this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      // Información básica
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      
      // Precios
      price: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      
      // Categorización
      category: ['', Validators.required],
      brand: ['', Validators.required],
      productType: ['physical', Validators.required],

      
      // Inventario
      stock: [, [Validators.required, Validators.min(0)]],
      minStock: [,],
      maxStock: [, ],
      
      // Imágenes (FormArray)
      images: this.fb.array([]),
      
      // Identificación
      barcode: [''],
      
      // Estados
      isActive: [true],
    });

  }

  private setupFormListener(): void {
  this.productForm.valueChanges
    .pipe(
      debounceTime(300)
    )
    .subscribe(() => {
      const dto = this.mapFormToDto();
      this.productChange.emit({
        data: dto,
        isValid: this.productForm.valid
      });
    });
  }

private mapFormToDto(): CreateProductDto {
  const formValue = this.productForm.getRawValue();

  const dto: CreateProductDto = {
    sku: formValue.sku.trim(),
    name: formValue.name.trim(),
    description: formValue.description.trim(),
    price: Number(formValue.price), // Convertir a number
    costPrice: formValue.costPrice ? Number(formValue.costPrice) : undefined, // Convertir a number
    category: formValue.category,
    brand: formValue.brand?.trim() || undefined,
    productType: formValue.productType,
    stock: Number(formValue.stock), // Convertir a number
    minStock: formValue.minStock ? Number(formValue.minStock) : undefined, // Convertir a number
    maxStock: formValue.maxStock ? Number(formValue.maxStock) : undefined, // Convertir a number
    images: formValue.images.filter((img:string) => img.trim() !== ''),
    barcode: formValue.barcode?.trim() || undefined,
    companyId: formValue.companyId,
    isActive: formValue.isActive
  };

  return dto;
}

  /**
   * Populates the form with product data
   * Used for edit mode when productData input is provided
   */
  populateForm(data: Product | CreateProductDto): void {
    if (!this.productForm) {
      return;
    }
    console.log(data);
    // Disable form change listener temporarily to avoid emitting during population
    this.productForm.patchValue({
      sku: data.sku || '',
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      costPrice: data.costPrice || 0,
      category: data.category || '',
      brand: data.brand || '',
      productType: data.productType || 'physical',
      stock: data.stock ?? 0,
      minStock: data.minStock ?? 0,
      maxStock: data.maxStock ?? 0,
      barcode: data.barcode || '',
      isActive: data.isActive ?? true
    }, { emitEvent: false });

    // Manually trigger validation and emit the current state
    this.productForm.updateValueAndValidity();

    // Emit the initial state
    const dto = this.mapFormToDto();
    this.productChange.emit({
      data: dto,
      isValid: this.productForm.valid
    });
  }
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
}
