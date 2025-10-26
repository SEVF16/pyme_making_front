import {
  Purchase,
  PurchaseItem,
  PaymentMethod,
  PurchaseStatus,
  CreatePurchaseDto
} from './purchase.interfaces';

/**
 * Clase modelo para el item de compra con metodos utiles
 */
export class PurchaseItemModel implements PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  constructor(data?: Partial<PurchaseItem>) {
    this.id = data?.id;
    this.productId = data?.productId || '';
    this.productName = data?.productName || '';
    this.productSku = data?.productSku || '';
    this.quantity = data?.quantity || 1;
    this.unitPrice = data?.unitPrice || 0;
    this.discount = data?.discount || 0;
    this.tax = data?.tax || 0;

    // Calcular valores
    this.subtotal = this.calculateSubtotal();
    this.total = this.calculateTotal();
  }

  /**
   * Calcula el subtotal del item (cantidad * precio unitario)
   */
  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }

  /**
   * Calcula el total del item (subtotal - descuento + impuesto)
   */
  calculateTotal(): number {
    return this.subtotal - this.discount + this.tax;
  }

  /**
   * Actualiza la cantidad y recalcula totales
   */
  updateQuantity(quantity: number): void {
    this.quantity = quantity;
    this.subtotal = this.calculateSubtotal();
    this.total = this.calculateTotal();
  }

  /**
   * Actualiza el precio unitario y recalcula totales
   */
  updateUnitPrice(price: number): void {
    this.unitPrice = price;
    this.subtotal = this.calculateSubtotal();
    this.total = this.calculateTotal();
  }

  /**
   * Aplica un descuento y recalcula el total
   */
  applyDiscount(discount: number): void {
    this.discount = discount;
    this.total = this.calculateTotal();
  }

  /**
   * Aplica un impuesto y recalcula el total
   */
  applyTax(tax: number): void {
    this.tax = tax;
    this.total = this.calculateTotal();
  }
}

/**
 * Clase modelo para la compra con metodos de negocio
 */
export class PurchaseModel implements Purchase {
  id?: string;
  purchaseNumber?: string;
  supplierId?: string;
  supplierName?: string;
  items: PurchaseItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  status: PurchaseStatus;
  notes?: string;
  companyId: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<Purchase>) {
    this.id = data?.id;
    this.purchaseNumber = data?.purchaseNumber;
    this.supplierId = data?.supplierId;
    this.supplierName = data?.supplierName;
    this.items = data?.items?.map(item => new PurchaseItemModel(item)) || [];
    this.paymentMethodId = data?.paymentMethodId;
    this.paymentMethod = data?.paymentMethod;
    this.status = data?.status || 'draft';
    this.notes = data?.notes;
    this.companyId = data?.companyId || '';
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;

    // Calcular totales
    this.subtotal = this.calculateSubtotal();
    this.totalDiscount = this.calculateTotalDiscount();
    this.totalTax = this.calculateTotalTax();
    this.total = this.calculateTotal();
  }

  /**
   * Calcula el subtotal de todos los items
   */
  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Calcula el total de descuentos
   */
  calculateTotalDiscount(): number {
    return this.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  }

  /**
   * Calcula el total de impuestos
   */
  calculateTotalTax(): number {
    return this.items.reduce((sum, item) => sum + (item.tax || 0), 0);
  }

  /**
   * Calcula el total de la compra
   */
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Agrega un item a la compra
   */
  addItem(item: PurchaseItem): void {
    this.items.push(new PurchaseItemModel(item));
    this.recalculateTotals();
  }

  /**
   * Elimina un item de la compra por indice
   */
  removeItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.recalculateTotals();
    }
  }

  /**
   * Elimina un item de la compra por ID de producto
   */
  removeItemByProductId(productId: string): void {
    const index = this.items.findIndex(item => item.productId === productId);
    if (index !== -1) {
      this.removeItem(index);
    }
  }

  /**
   * Actualiza un item existente
   */
  updateItem(index: number, item: Partial<PurchaseItem>): void {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = new PurchaseItemModel({ ...this.items[index], ...item });
      this.recalculateTotals();
    }
  }

  /**
   * Recalcula todos los totales
   */
  recalculateTotals(): void {
    this.subtotal = this.calculateSubtotal();
    this.totalDiscount = this.calculateTotalDiscount();
    this.totalTax = this.calculateTotalTax();
    this.total = this.calculateTotal();
  }

  /**
   * Establece el metodo de pago
   */
  setPaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethod = paymentMethod;
    this.paymentMethodId = paymentMethod.id;
  }

  /**
   * Verifica si la compra es valida para ser guardada
   */
  isValid(): boolean {
    return (
      this.items.length > 0 &&
      this.companyId !== '' &&
      this.total > 0
    );
  }

  /**
   * Verifica si la compra puede ser completada
   */
  canBeCompleted(): boolean {
    return (
      this.isValid() &&
      this.paymentMethodId !== undefined &&
      this.status === 'draft'
    );
  }

  /**
   * Obtiene el numero de items en la compra
   */
  getItemsCount(): number {
    return this.items.length;
  }

  /**
   * Obtiene la cantidad total de productos
   */
  getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Convierte la instancia a un DTO para crear compra
   */
  toCreateDto(): CreatePurchaseDto {
    return {
      supplierId: this.supplierId,
      items: this.items,
      paymentMethodId: this.paymentMethodId,
      notes: this.notes,
      companyId: this.companyId
    };
  }

  /**
   * Limpia todos los items de la compra
   */
  clear(): void {
    this.items = [];
    this.recalculateTotals();
  }
}
