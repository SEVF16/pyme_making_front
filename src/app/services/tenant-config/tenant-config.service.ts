import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from '../api/base-api.service';
import {
  TenantConfigResponseDto,
  CreateTenantConfigDto,
  UpdateTenantConfigDto,
  TaxCalculationRequestDto,
  TaxCalculationResponseDto,
  PriceRoundingRequestDto,
  PriceRoundingResponseDto,
  NextInvoiceNumberResponseDto,
  PaymentMethod,
  PaymentTerm,
  InvoiceType,
  PriceRoundingRule,
  isPaymentMethodEnabled,
  isPaymentTermAvailable,
  isInvoiceTypeEnabled,
  canSellWithNegativeStock,
  isStockControlEnabled,
  isSiiEnabled,
  calculateTax,
  applyPriceRounding
} from '../../interfaces/tenant-config.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TenantConfigService extends BaseApiService<
  TenantConfigResponseDto,
  CreateTenantConfigDto,
  UpdateTenantConfigDto
> {
  protected override endpoint = 'config';

  // BehaviorSubject para mantener la configuración en memoria
  private configSubject = new BehaviorSubject<TenantConfigResponseDto | null>(null);
  public config$ = this.configSubject.asObservable();

  /**
   * Inicializa configuración por defecto para el tenant actual
   */
  initializeConfig(): Observable<TenantConfigResponseDto> {
    return this.http.post<TenantConfigResponseDto>(
      `${this.apiUrl}/${this.endpoint}/initialize`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Obtiene la configuración del tenant actual
   */
  getCurrentConfig(): Observable<TenantConfigResponseDto> {
    return this.http.get<TenantConfigResponseDto>(
      `${this.apiUrl}/${this.endpoint}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Actualiza la configuración del tenant actual
   */
  updateCurrentConfig(dto: UpdateTenantConfigDto): Observable<TenantConfigResponseDto> {
    return this.http.put<TenantConfigResponseDto>(
      `${this.apiUrl}/${this.endpoint}`,
      dto,
      { headers: this.getHeaders() }
    ).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Calcula impuesto para un monto dado
   */
  calculateTaxForAmount(request: TaxCalculationRequestDto): Observable<TaxCalculationResponseDto> {
    return this.http.post<TaxCalculationResponseDto>(
      `${this.apiUrl}/${this.endpoint}/tax-calculation`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Aplica redondeo de precio según configuración
   */
  applyPriceRounding(request: PriceRoundingRequestDto): Observable<PriceRoundingResponseDto> {
    return this.http.post<PriceRoundingResponseDto>(
      `${this.apiUrl}/${this.endpoint}/price-rounding`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtiene el siguiente número de factura
   */
  getNextInvoiceNumber(): Observable<NextInvoiceNumberResponseDto> {
    return this.http.get<NextInvoiceNumberResponseDto>(
      `${this.apiUrl}/${this.endpoint}/next-invoice-number`,
      { headers: this.getHeaders() }
    );
  }

  // ============================================
  // MÉTODOS DE UTILIDAD (Usan la config en memoria)
  // ============================================

  /**
   * Obtiene la configuración actual del BehaviorSubject
   */
  getConfig(): TenantConfigResponseDto | null {
    return this.configSubject.value;
  }

  /**
   * Valida si un método de pago está habilitado
   */
  isPaymentMethodEnabled(method: PaymentMethod): boolean {
    const config = this.getConfig();
    return config ? isPaymentMethodEnabled(method, config) : false;
  }

  /**
   * Valida si un término de pago está disponible
   */
  isPaymentTermAvailable(term: PaymentTerm): boolean {
    const config = this.getConfig();
    return config ? isPaymentTermAvailable(term, config) : false;
  }

  /**
   * Valida si un tipo de factura está habilitado
   */
  isInvoiceTypeEnabled(type: InvoiceType): boolean {
    const config = this.getConfig();
    return config ? isInvoiceTypeEnabled(type, config) : false;
  }

  /**
   * Valida si se puede vender con stock negativo
   */
  canSellWithNegativeStock(): boolean {
    const config = this.getConfig();
    return config ? canSellWithNegativeStock(config) : false;
  }

  /**
   * Valida si el control de stock está habilitado
   */
  isStockControlEnabled(): boolean {
    const config = this.getConfig();
    return config ? isStockControlEnabled(config) : false;
  }

  /**
   * Valida si el SII está habilitado
   */
  isSiiEnabled(): boolean {
    const config = this.getConfig();
    return config ? isSiiEnabled(config) : false;
  }

  /**
   * Obtiene la tasa de IVA
   */
  getIvaRate(): number {
    return this.getConfig()?.tax.ivaRate || 0;
  }

  /**
   * Obtiene el modo de cálculo de impuestos
   */
  getTaxCalculationMode(): 'included' | 'excluded' {
    return this.getConfig()?.tax.calculationMode || 'included';
  }

  /**
   * Obtiene la regla de redondeo de precios
   */
  getPriceRoundingRule(): PriceRoundingRule {
    return this.getConfig()?.inventory.priceRoundingRule || PriceRoundingRule.EXACT;
  }

  /**
   * Obtiene los métodos de pago habilitados
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return this.getConfig()?.sales.paymentMethods || [];
  }

  /**
   * Obtiene los términos de pago disponibles
   */
  getAvailablePaymentTerms(): PaymentTerm[] {
    return this.getConfig()?.sales.paymentTerms || [];
  }

  /**
   * Obtiene el término de pago por defecto
   */
  getDefaultPaymentTerm(): PaymentTerm | null {
    return this.getConfig()?.sales.defaultPaymentTerm || null;
  }

  /**
   * Calcula impuesto localmente usando la configuración en memoria
   */
  calculateTaxLocal(amount: number): { net: number; tax: number; total: number } {
    const config = this.getConfig();
    if (!config) {
      return { net: amount, tax: 0, total: amount };
    }

    return calculateTax(
      amount,
      config.tax.ivaRate,
      config.tax.calculationMode,
      config.tax.ivaEnabled
    );
  }

  /**
   * Aplica redondeo localmente usando la configuración en memoria
   */
  applyPriceRoundingLocal(price: number): number {
    const rule = this.getPriceRoundingRule();
    return applyPriceRounding(price, rule);
  }

  /**
   * Calcula precio final con impuestos y redondeo
   */
  calculateFinalPrice(basePrice: number): {
    net: number;
    tax: number;
    total: number;
    roundedTotal: number;
  } {
    const { net, tax, total } = this.calculateTaxLocal(basePrice);
    const roundedTotal = this.applyPriceRoundingLocal(total);

    return { net, tax, total, roundedTotal };
  }

  /**
   * Valida si la configuración está activa
   */
  isConfigActive(): boolean {
    return this.getConfig()?.isActive || false;
  }

  /**
   * Valida si requiere cliente para facturar
   */
  requiresCustomerForInvoice(): boolean {
    return this.getConfig()?.sales.requireCustomer || false;
  }

  /**
   * Obtiene el stock mínimo por defecto
   */
  getDefaultMinStock(): number {
    return this.getConfig()?.inventory.defaultMinStock || 0;
  }

  /**
   * Valida si las alertas de stock bajo están habilitadas
   */
  areLowStockAlertsEnabled(): boolean {
    return this.getConfig()?.inventory.lowStockAlertsEnabled || false;
  }
}
