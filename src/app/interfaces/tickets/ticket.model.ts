// ticket.model.ts
import { ITicket, ICreateTicketDto, ICustomerData, ITicketItem } from './ticket.interface';
import { TicketStatus } from './ticket-status.enum';

export class Ticket implements ITicket {
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

  constructor(data: Partial<ITicket> = {}) {
    this.id = data.id || '';
    this.ticketNumber = data.ticketNumber || '';
    this.status = data.status || TicketStatus.DRAFT;
    this.companyId = data.companyId || '';
    this.customerId = data.customerId || null;
    this.customerData = data.customerData || null;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.taxTotal = data.taxTotal || 0;
    this.discountTotal = data.discountTotal || 0;
    this.total = data.total || 0;
    this.paymentMethod = data.paymentMethod || '';
    this.transactionReference = data.transactionReference || null;
    this.notes = data.notes || null;
    this.issueDate = data.issueDate || new Date();
    this.issuedAt = data.issuedAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.posSaleId = data.posSaleId || null;
    this.convertedToInvoiceId = data.convertedToInvoiceId || null;
    this.convertedAt = data.convertedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.legalDisclaimer = data.legalDisclaimer || 'ESTE DOCUMENTO NO ES VÁLIDO COMO BOLETA TRIBUTARIA';
  }

  toCreateDto(): ICreateTicketDto {
    return {
      companyId: this.companyId,
      customerId: this.customerId || undefined,
      customerData: this.customerData || undefined,
      items: this.items.map(item => ({
        productId: item.productId || undefined,
        description: item.description,
        sku: item.sku || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate
      })),
      paymentMethod: this.paymentMethod,
      transactionReference: this.transactionReference || undefined,
      posSaleId: this.posSaleId || undefined,
      notes: this.notes || undefined,
      issueDate: this.issueDate
    };
  }

  canCancel(): boolean {
    return this.status === TicketStatus.ISSUED && !this.convertedToInvoiceId;
  }

  canConvert(): boolean {
    return this.status === TicketStatus.ISSUED && !this.convertedToInvoiceId;
  }

  isConverted(): boolean {
    return !!this.convertedToInvoiceId;
  }

  isCancelled(): boolean {
    return this.status === TicketStatus.CANCELLED;
  }

  isDraft(): boolean {
    return this.status === TicketStatus.DRAFT;
  }
}
