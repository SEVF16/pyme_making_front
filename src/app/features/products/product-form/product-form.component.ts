import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Option, SelectLibComponent } from '../../../shared/components/select-lib/select-lib.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [InputComponent, SelectLibComponent],
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
  ngOnInit(): void {
    this.initializeForm();
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
      unit: ['unidad', Validators.required],
      
      // Inventario
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0,],
      maxStock: [100, ],
      
      // Propiedades físicas
      weight: [0, [Validators.min(0)]],
      dimensions: [''],
      
      // Imágenes (FormArray)
      images: this.fb.array([]),
      
      // Identificación
      barcode: [''],
      companyId: ['', Validators.required],
      
      // Estados
      isActive: [true],
      allowNegativeStock: [false],
      
      // Tags (FormArray)
      tags: this.fb.array([]),
      
      // Información adicional (FormGroup)
      additionalInfo: this.fb.group({
        warranty: [''],
        origin: ['']
      })
    });

  }

}
