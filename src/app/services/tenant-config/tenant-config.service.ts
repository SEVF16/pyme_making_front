import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
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
export class TenantConfigService extends BaseApiService {
  private tenantId: string | null = null;
  private endpoint = 'config';

  // BehaviorSubject para mantener la configuración en memoria
  private configSubject = new BehaviorSubject<TenantConfigResponseDto | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    this.initializeTenantId();
  }

  /**
   * Inicializa el tenant-id desde localStorage (solo en browser)
   */
  private initializeTenantId(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.tenantId = localStorage.getItem('tenant_id');
    }
  }

  /**
   * Asegura que el tenant-id esté configurado antes de cada petición
   */
  private ensureTenantId(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentTenantId = localStorage.getItem('tenant_id');
      if (currentTenantId && currentTenantId !== this.tenantId) {
        this.tenantId = currentTenantId;
        this.headersService.setTenantId(currentTenantId);
      }
    }
  }

  /**
   * Inicializa configuración por defecto para el tenant actual
   */
  initializeConfig(): Observable<TenantConfigResponseDto> {
    this.ensureTenantId();
    return this.post<TenantConfigResponseDto>(`${this.endpoint}/initialize`, {}).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Obtiene la configuración del tenant actual
   */
  getCurrentConfig(): Observable<TenantConfigResponseDto> {
    this.ensureTenantId();
    return this.get<TenantConfigResponseDto>(this.endpoint).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Actualiza la configuración del tenant actual
   */
  updateCurrentConfig(dto: UpdateTenantConfigDto): Observable<TenantConfigResponseDto> {
    this.ensureTenantId();
    return this.put<TenantConfigResponseDto>(this.endpoint, dto).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Calcula impuesto para un monto dado
   */
  calculateTaxForAmount(request: TaxCalculationRequestDto): Observable<TaxCalculationResponseDto> {
    this.ensureTenantId();
    return this.post<TaxCalculationResponseDto>(`${this.endpoint}/tax-calculation`, request);
  }

  /**
   * Aplica redondeo de precio según configuración
   */
  applyPriceRounding(request: PriceRoundingRequestDto): Observable<PriceRoundingResponseDto> {
    this.ensureTenantId();
    return this.post<PriceRoundingResponseDto>(`${this.endpoint}/price-rounding`, request);
  }

  /**
   * Obtiene el siguiente número de factura
   */
  getNextInvoiceNumber(): Observable<NextInvoiceNumberResponseDto> {
    this.ensureTenantId();
    return this.get<NextInvoiceNumberResponseDto>(`${this.endpoint}/next-invoice-number`);
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
