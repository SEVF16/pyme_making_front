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
    this.companyId = data?.companyId || 'fbbb5649-59a9-48b7-a94f-99aac852bb5c';

    // Campos opcionales
    this.id = data?.id;
    this.birthDate = data?.birthDate;
    this.website = data?.website;
    this.additionalInfo = data?.additionalInfo;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
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
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      region: this.region,
      postalCode: this.postalCode,
      customerType: this.customerType,
      birthDate: typeof this.birthDate === 'string' ? this.birthDate : this.birthDate?.toISOString(),
      website: this.website,
      additionalInfo: this.additionalInfo,
    };
  }

  
}