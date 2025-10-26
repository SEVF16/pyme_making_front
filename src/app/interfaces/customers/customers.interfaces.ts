/**
 * Estados posibles de un cliente
 */
export type ICustomerStatus = 'active' | 'inactive' | 'blocked';

/**
 * Tipos de cliente
 */
export type ICustomerType = 'individual' | 'business';

/**
 * Información adicional del cliente (campos dinámicos)
 */
export interface ICustomerAdditionalInfo {
  notes?: string;
  preferences?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Interface para el modelo de Cliente (Response del backend)
 */
export interface ICustomer {
  // Campos obligatorios
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
 // status: ICustomerStatus;
  companyId: string;

  // Campos opcionales
  birthDate?: string | Date;
  website?: string;
  additionalInfo?: ICustomerAdditionalInfo;

  // Auditoría (típicamente vienen del backend)
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * DTO para crear un nuevo cliente
 */
export interface ICreateCustomerDto {
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
//  status: ICustomerStatus;
  companyId: string;
  birthDate?: string;
  website?: string;
  additionalInfo?: ICustomerAdditionalInfo;
}

/**
 * DTO para actualizar un cliente existente
 */
export interface IUpdateCustomerDto extends Partial<ICreateCustomerDto> {
  id?: string;
}

