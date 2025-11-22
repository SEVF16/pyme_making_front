import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantConfigService } from '../../services/tenant-config/tenant-config.service';
import {
  TenantConfigResponseDto,
  UpdateTenantConfigDto,
  PaymentMethod,
  PaymentTerm,
  InvoiceType,
  TaxCalculationMode,
  PriceRoundingRule,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TERM_LABELS,
  INVOICE_TYPE_LABELS,
  TAX_MODE_LABELS,
  ROUNDING_RULE_LABELS
} from '../../interfaces/tenant-config.interfaces';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectLibComponent } from '../../shared/components/select-lib/select-lib.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../shared/components/buttonlib/interfaces/button.interface';
import { Save, Settings, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tenant-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectLibComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './tenant-config.component.html',
  styleUrl: './tenant-config.component.scss'
})
export class TenantConfigComponent implements OnInit {
  readonly SaveIcon = Save;
  readonly SettingsIcon = Settings;

  config = signal<TenantConfigResponseDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  activeTab = signal<'tax' | 'sales' | 'inventory' | 'general'>('tax');

  // Formularios
  taxForm!: FormGroup;
  salesForm!: FormGroup;
  inventoryForm!: FormGroup;
  generalForm!: FormGroup;

  // Opciones para selects
  taxModeOptions = Object.entries(TAX_MODE_LABELS).map(([value, label]) => ({ value, label }));
  roundingRuleOptions = Object.entries(ROUNDING_RULE_LABELS).map(([value, label]) => ({ value, label }));

  paymentMethodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value: value as PaymentMethod,
    label
  }));

  paymentTermOptions = Object.entries(PAYMENT_TERM_LABELS).map(([value, label]) => ({
    value: value as PaymentTerm,
    label
  }));

  invoiceTypeOptions = Object.entries(INVOICE_TYPE_LABELS).map(([value, label]) => ({
    value: value as InvoiceType,
    label
  }));

  saveButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Guardar Cambios',
    iconPosition: 'left'
  };

  constructor(
    private fb: FormBuilder,
    private configService: TenantConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadConfig();
  }

  initForms(): void {
    // Tax Form
    this.taxForm = this.fb.group({
      ivaRate: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      ivaEnabled: [true],
      taxCalculationMode: [TaxCalculationMode.INCLUDED],
      siiEnabled: [false],
      siiEnvironment: ['']
    });

    // Sales Form
    this.salesForm = this.fb.group({
      invoiceSeriesPrefix: ['VENTA', Validators.required],
      requireCustomerForInvoice: [true],
      defaultPaymentTerm: [PaymentTerm.IMMEDIATE]
    });

    // Inventory Form
    this.inventoryForm = this.fb.group({
      stockControlEnabled: [true],
      allowNegativeStock: [false],
      lowStockAlertsEnabled: [true],
      defaultMinStock: [5, [Validators.required, Validators.min(0)]],
      priceRoundingRule: [PriceRoundingRule.TO_990],
      defaultProductUnit: ['unidad']
    });

    // General Form
    this.generalForm = this.fb.group({
      baseCurrency: ['CLP', Validators.required],
      timezone: ['America/Santiago', Validators.required],
      dateFormat: ['DD/MM/YYYY'],
      locale: ['es-CL']
    });
  }

  loadConfig(): void {
    this.loading.set(true);
    this.error.set(null);

    this.configService.getCurrentConfig().subscribe({
      next: (config) => {
        this.config.set(config);
        this.patchForms(config);
        this.loading.set(false);
      },
      error: (error) => {
        if (error.status === 404) {
          this.error.set('No se encontró configuración para este tenant');
          this.router.navigate(['/config/initialize']);
        } else {
          this.error.set('Error al cargar la configuración');
        }
        this.loading.set(false);
      }
    });
  }

  patchForms(config: TenantConfigResponseDto): void {
    // Tax
    this.taxForm.patchValue({
      ivaRate: config.tax.ivaRate,
      ivaEnabled: config.tax.ivaEnabled,
      taxCalculationMode: config.tax.calculationMode,
      siiEnabled: config.tax.siiEnabled,
      siiEnvironment: config.tax.siiEnvironment || ''
    });

    // Sales
    this.salesForm.patchValue({
      invoiceSeriesPrefix: config.sales.invoiceSeriesPrefix,
      requireCustomerForInvoice: config.sales.requireCustomer,
      defaultPaymentTerm: config.sales.defaultPaymentTerm
    });

    // Inventory
    this.inventoryForm.patchValue({
      stockControlEnabled: config.inventory.stockControlEnabled,
      allowNegativeStock: config.inventory.allowNegativeStock,
      lowStockAlertsEnabled: config.inventory.lowStockAlertsEnabled,
      defaultMinStock: config.inventory.defaultMinStock,
      priceRoundingRule: config.inventory.priceRoundingRule,
      defaultProductUnit: config.inventory.defaultUnit
    });

    // General
    this.generalForm.patchValue({
      baseCurrency: config.general.currency,
      timezone: config.general.timezone,
      dateFormat: config.general.dateFormat,
      locale: config.general.locale
    });
  }

  setActiveTab(tab: 'tax' | 'sales' | 'inventory' | 'general'): void {
    this.activeTab.set(tab);
  }

  saveConfig(): void {
    const currentTab = this.activeTab();
    let formToValidate: FormGroup;
    let updateDto: UpdateTenantConfigDto = {};

    switch (currentTab) {
      case 'tax':
        formToValidate = this.taxForm;
        if (formToValidate.valid) {
          updateDto = {
            ivaRate: formToValidate.value.ivaRate,
            ivaEnabled: formToValidate.value.ivaEnabled,
            taxCalculationMode: formToValidate.value.taxCalculationMode,
            siiEnabled: formToValidate.value.siiEnabled,
            siiEnvironment: formToValidate.value.siiEnvironment || undefined
          };
        }
        break;

      case 'sales':
        formToValidate = this.salesForm;
        if (formToValidate.valid) {
          updateDto = {
            invoiceSeriesPrefix: formToValidate.value.invoiceSeriesPrefix,
            requireCustomerForInvoice: formToValidate.value.requireCustomerForInvoice,
            defaultPaymentTerm: formToValidate.value.defaultPaymentTerm
          };
        }
        break;

      case 'inventory':
        formToValidate = this.inventoryForm;
        if (formToValidate.valid) {
          updateDto = {
            stockControlEnabled: formToValidate.value.stockControlEnabled,
            allowNegativeStock: formToValidate.value.allowNegativeStock,
            lowStockAlertsEnabled: formToValidate.value.lowStockAlertsEnabled,
            defaultMinStock: formToValidate.value.defaultMinStock,
            priceRoundingRule: formToValidate.value.priceRoundingRule,
            defaultProductUnit: formToValidate.value.defaultProductUnit
          };
        }
        break;

      case 'general':
        formToValidate = this.generalForm;
        if (formToValidate.valid) {
          updateDto = {
            baseCurrency: formToValidate.value.baseCurrency,
            timezone: formToValidate.value.timezone,
            dateFormat: formToValidate.value.dateFormat,
            locale: formToValidate.value.locale
          };
        }
        break;

      default:
        return;
    }

    if (!formToValidate!.valid) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.configService.updateCurrentConfig(updateDto).subscribe({
      next: (config) => {
        this.config.set(config);
        this.loading.set(false);
        alert('Configuración actualizada exitosamente');
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al actualizar la configuración');
      }
    });
  }
}
