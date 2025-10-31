import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PurchaseItem } from '../../../../interfaces/purchase/purchase.interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Option } from '../../../../shared/components/select-lib/select-lib.component';
import { AutocompleteLibComponent } from '../../../../shared/components/autocomplete-lib/autocomplete-lib.component';
import { Product, ProductQueryParams } from '../../../../interfaces/product.interfaces';
import { ProductsService } from '../../../../services/products/products.service';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ApiResponse } from '../../../../interfaces/api-response.interfaces';

/**
 * Componente Dumb/Presentacional para mostrar los productos seleccionados
 *
 * Responsabilidades:
 * - Recibe lista de productos via @Input
 * - Emite eventos de acciones (eliminar, actualizar cantidad)
 * - Solo logica de presentacion
 * - Usa OnPush para optimizar rendimiento
 */
@Component({
  selector: 'app-purchase-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, AutocompleteLibComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-products.component.html',

})
export class PurchaseProductsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) products: PurchaseItem[] = [];
  @Input() readonly: boolean = false;

  @Output() removeProduct = new EventEmitter<number>();
  
  @Output() quantityChange = new EventEmitter<{ index: number; quantity: number }>();

  private destroy$ = new Subject<void>();

  isLoading = false;
  productOptions: Option[] = [];
  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private productService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.formBuilder.group({
      selectedUser: ['']
    });
  }

  ngOnInit() {
    // Configurar el stream de búsqueda directamente con valueChanges
    this.form.get('selectedUser')?.valueChanges.pipe(
      debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo emite si el valor cambió
      switchMap(query => this.performSearch(query || '')),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (options: Option[]) => {
        this.productOptions = options;
        this.isLoading = false;
        this.cdr.markForCheck(); // Marcar para detección de cambios
      },
      error: (error) => {
        console.error('Error en búsqueda de productos:', error);
        this.productOptions = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método privado que realiza la búsqueda actual
  private performSearch(query: string) {
    if (query.length < 3) {
      this.isLoading = true;
      return of([]);
    }

    // Activar loading state
    this.isLoading = true;
    this.cdr.markForCheck();

    const params: ProductQueryParams = {
      q: query,
      limit: 10
    };

    return this.productService.getProductsSearch(params).pipe(
      map((response: ApiResponse<Product[]>) => {

        return response.data.map(product => ({
          label: `${product.name} - ${product.barcode}`,
          value: product.id || ''
        }));
      }),
      catchError(error => {
        console.error('Error searching products:', error);
        return of([]);
      })
    );
  }

  onUserSelect(option: Option) {
    console.log('Usuario seleccionado:', option);
    // Lógica adicional cuando se selecciona un producto
  }

  onUserClear() {
    console.log('Autocomplete limpiado');
    this.productOptions = [];
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  onRemoveProduct(index: number): void {
    this.removeProduct.emit(index);
  }

  onQuantityChange(index: number, quantity: number): void {
    if (quantity > 0) {
      this.quantityChange.emit({ index, quantity });
    }
  }
}
