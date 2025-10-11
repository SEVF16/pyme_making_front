import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Option, SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { CreateProductDto, ProductChangeEvent, } from '../../../interfaces/product.interfaces';
import { debounceTime, filter, startWith, tap } from 'rxjs';


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
  
  productForm!: FormGroup;
  categories: Option[] = [
    { label: 'Electrónicos', value: 'electronics' },
    { label: 'Ropa', value: 'clothing' }
  ];
  uploadedFiles: any[] = [];
productChange = output<ProductChangeEvent>();
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListener();
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
      companyId: ['', Validators.required],
      
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
        product: dto,
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
      price: formValue.price,
      costPrice: formValue.costPrice || undefined,
      category: formValue.category,
      brand: formValue.brand?.trim() || undefined,
      productType: formValue.productType,
      stock: formValue.stock,
      minStock: formValue.minStock || undefined,
      maxStock: formValue.maxStock || undefined,
      images: formValue.images.filter((img:string) => img.trim() !== ''),
      barcode: formValue.barcode?.trim() || undefined,
      companyId: formValue.companyId,
      isActive: formValue.isActive
    };

    return dto;
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
