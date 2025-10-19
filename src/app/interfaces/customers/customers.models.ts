import { ICreateCustomerDto, ICustomer, ICustomerAdditionalInfo, ICustomerStatus, ICustomerType, IUpdateCustomerDto } from "./customers.interfaces";

/**
 * Clase para el modelo de Cliente con valores por defecto
 * Útil para instanciar clientes con configuración inicial
 */
export class Customer implements ICustomer {
  id?: string;
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  customerType: ICustomerType;
  //status: ICustomerStatus;
  companyId: string;
  birthDate?: string | Date;
  website?: string;
  additionalInfo?: ICustomerAdditionalInfo;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  constructor(data?: Partial<ICustomer>) {
    // Campos obligatorios
    this.rut = data?.rut || '';
    this.firstName = data?.firstName || '';
    this.lastName = data?.lastName || '';
    this.email = data?.email || '';
    this.phone = data?.phone || '';
    this.address = data?.address || '';
    this.city = data?.city || '';
    this.region = data?.region || '';
    this.postalCode = data?.postalCode || '7500000';
    this.customerType = data?.customerType || 'individual';
 //   this.status = data?.status || 'active';
    this.companyId = data?.companyId || '4e3657a9-31be-4af7-b1a8-a6380d3fb107';

    // Campos opcionales
    this.id = data?.id;
    this.birthDate = data?.birthDate;
    this.website = data?.website;
    this.additionalInfo = data?.additionalInfo;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }

  /**
   * Obtiene el nombre completo del cliente
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Verifica si el cliente está activo
   */
  // isActive(): boolean {
  //   return this.status === 'active';
  // }

  /**
   * Verifica si el cliente está bloqueado
  //  */
  // isBlocked(): boolean {
  //   return this.status === 'blocked';
  // }

  /**
   * Verifica si es cliente tipo empresa
   */
  isBusiness(): boolean {
    return this.customerType === 'business';
  }

  /**
   * Verifica si es cliente individual
   */
  isIndividual(): boolean {
    return this.customerType === 'individual';
  }

  /**
   * Obtiene las preferencias del cliente
   */
  getPreferences(): string[] {
    return this.additionalInfo?.preferences || [];
  }

  /**
   * Obtiene las notas del cliente
   */
  getNotes(): string {
    return this.additionalInfo?.notes || '';
  }

  /**
   * Verifica si tiene notas
   */
  hasNotes(): boolean {
    return !!this.additionalInfo?.notes;
  }

  /**
   * Convierte a DTO para crear
   */
  toCreateDto(): ICreateCustomerDto {
    return {
      rut: this.rut,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      region: this.region,
      postalCode: this.postalCode,
      customerType: this.customerType,
    //  status: this.status,
      companyId: this.companyId,
      birthDate: typeof this.birthDate === 'string' ? this.birthDate : this.birthDate?.toISOString(),
      website: this.website,
      additionalInfo: this.additionalInfo,
    };
  }

  /**
   * Convierte a DTO para actualizar
   */
  toUpdateDto(): IUpdateCustomerDto {
    return {
      id: this.id!,
      ...this.toCreateDto(),
    };
  }

  /**
   * Formatea el RUT con puntos y guión (ejemplo: 12.345.678-9)
   */
  getFormattedRut(): string {
    if (!this.rut) return '';
    
    const cleaned = this.rut.replace(/[^0-9kK]/g, '');
    if (cleaned.length < 2) return cleaned;
    
    const body = cleaned.slice(0, -1);
    const verifier = cleaned.slice(-1);
    
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedBody}-${verifier}`;
  }

  /**
   * Calcula la edad del cliente (si tiene birthDate)
   */
  getAge(): number | null {
    if (!this.birthDate) return null;
    
    const birthDate = typeof this.birthDate === 'string' 
      ? new Date(this.birthDate) 
      : this.birthDate;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obtiene badge class según el estado
   */
  // getStatusBadgeClass(): string {
  //   switch (this.status) {
  //     case 'active':
  //       return 'bg-success';
  //     case 'inactive':
  //       return 'bg-secondary';
  //     case 'blocked':
  //       return 'bg-danger';
  //     default:
  //       return 'bg-secondary';
  //   }
  // }

  // /**
  //  * Obtiene texto traducido del estado
  //  */
  // getStatusLabel(): string {
  //   switch (this.status) {
  //     case 'active':
  //       return 'Activo';
  //     case 'inactive':
  //       return 'Inactivo';
  //     case 'blocked':
  //       return 'Bloqueado';
  //     default:
  //       return this.status;
  //   }
  // }

  // /**
  //  * Obtiene texto traducido del tipo
  //  */
  // getTypeLabel(): string {
  //   switch (this.customerType) {
  //     case 'individual':
  //       return 'Individual';
  //     case 'business':
  //       return 'Empresa';
  //     default:
  //       return this.customerType;
  //   }
  // }
}