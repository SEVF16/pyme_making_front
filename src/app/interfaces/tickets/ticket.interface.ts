// ticket.interface.ts
import { TicketStatus } from './ticket-status.enum';

export interface ITicketItem {
  id: string;
  productId: string | null;
  description: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface ICustomerData {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ITicket {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  companyId: string;

  customerId: string | null;
  customerData: ICustomerData | null;

  items: ITicketItem[];

  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;

  paymentMethod: string;
  transactionReference: string | null;

  notes: string | null;
  issueDate: Date | string;
  issuedAt: Date | string | null;
  cancelledAt: Date | string | null;

  posSaleId: string | null;
  convertedToInvoiceId: string | null;
  convertedAt: Date | string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  legalDisclaimer: string;
}

export interface ICreateTicketItemDto {
  productId?: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  notes?: string;
}

export interface ICreateTicketDto {
  companyId: string;
  customerId?: string;
  customerData?: ICustomerData;
  items: ICreateTicketItemDto[];
  paymentMethod: string;
  transactionReference?: string;
  posSaleId?: string;
  notes?: string;
  issueDate?: Date | string;
}

export interface ICreateSalesDocumentDto {
  companyId: string;
  customerId?: string;
  customerData?: ICustomerData;
  items: ICreateTicketItemDto[];
  paymentMethod: string;
  transactionReference?: string;
  posSaleId?: string;
  notes?: string;
  issueDate?: Date | string;
}

export interface ISalesDocumentResult {
  documentType: 'TICKET' | 'INVOICE';
  documentId: string;
  documentNumber: string;
  requiresSiiValidation: boolean;
  pdfUrl?: string;
  dteReady?: boolean;
}

export interface ICancelTicketDto {
  reason?: string;
}

export interface IConvertToBoletaResult {
  invoice: any;
  ticket: ITicket;
  message: string;
}
