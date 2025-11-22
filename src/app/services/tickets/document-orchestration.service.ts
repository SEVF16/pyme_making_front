// document-orchestration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import {
  ICreateSalesDocumentDto,
  ISalesDocumentResult
} from '../../interfaces/tickets/ticket.interface';
import { ApiResponse } from '../../interfaces/api-response.interfaces';

/**
 * Servicio de orquestación para decidir automáticamente entre Ticket o Boleta
 * según la configuración SII del tenant
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentOrchestrationService extends BaseApiService {
  constructor(
    override http: HttpClient,
    override headersService: HeadersService
  ) {
    super(http, headersService);
  }

  /**
   * Crea un documento de venta (Ticket o Boleta) según configuración SII
   * Este método consulta la configuración del tenant y decide automáticamente
   */
  async createSalesDocument(data: ICreateSalesDocumentDto): Promise<ISalesDocumentResult> {
    try {
      // El backend decidirá automáticamente según tenantConfig.siiEnabled
      const result = await firstValueFrom(
        this.post<ApiResponse<ISalesDocumentResult>>(
          'documents/create-sales-document',
          data
        ).pipe(
          map(response => response.data)
        )
      );

      return result;
    } catch (error) {
      console.error('Error creating sales document:', error);
      throw error;
    }
  }

  /**
   * Fuerza la creación de un ticket (sin validación SII)
   */
  async createTicketWithoutSII(data: ICreateSalesDocumentDto): Promise<ISalesDocumentResult> {
    try {
      const result = await firstValueFrom(
        this.post<ApiResponse<ISalesDocumentResult>>(
          'tickets/create-and-issue',
          data
        ).pipe(
          map(response => ({
            documentType: 'TICKET' as const,
            documentId: response.data.id,
            documentNumber: response.data.ticketNumber,
            requiresSiiValidation: false
          }))
        )
      );

      return result;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Fuerza la creación de una boleta (con validación SII)
   */
  async createBoletaWithSII(data: ICreateSalesDocumentDto): Promise<ISalesDocumentResult> {
    try {
      const result = await firstValueFrom(
        this.post<ApiResponse<any>>(
          'invoices/create-boleta',
          data
        ).pipe(
          map(response => ({
            documentType: 'INVOICE' as const,
            documentId: response.data.id,
            documentNumber: response.data.invoiceNumber,
            requiresSiiValidation: true,
            pdfUrl: response.data.additionalInfo?.dtePdfUrl,
            dteReady: !!response.data.additionalInfo?.dteReadyAt
          }))
        )
      );

      return result;
    } catch (error) {
      console.error('Error creating boleta:', error);
      throw error;
    }
  }
}
