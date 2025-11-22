// tickets.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient } from '@angular/common/http';
import { HeadersService } from '../headers.service';
import { isPlatformBrowser } from '@angular/common';
import { map, Observable } from 'rxjs';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import {
  ITicket,
  ICreateTicketDto,
  ICancelTicketDto,
  IConvertToBoletaResult
} from '../../interfaces/tickets/ticket.interface';
import { TicketQueryDto } from '../../interfaces/tickets/ticket-query-params.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketsService extends BaseApiService {
  private currentTenantId: string | null = null;

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    this.initializeTenantId();
  }

  // ===== MÉTODOS DE INICIALIZACIÓN =====

  private initializeTenantId(): void {
    if (this.isBrowser()) {
      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId) {
        this.setTenantId(tenantId);
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ===== MÉTODOS PARA MANEJAR TENANT-ID =====

  setTenantId(tenantId: string): void {
    this.currentTenantId = tenantId;
    this.headersService.setHeader('x-tenant-id', tenantId);

    if (this.isBrowser()) {
      localStorage.setItem('tenant_id', tenantId);
    }
  }

  getTenantId(): string | null {
    return this.currentTenantId;
  }

  clearTenantId(): void {
    this.currentTenantId = null;
    this.headersService.removeHeader('x-tenant-id');

    if (this.isBrowser()) {
      localStorage.removeItem('tenant_id');
    }
  }

  private ensureTenantId(): void {
    if (!this.currentTenantId) {
      throw new Error('Tenant ID no está configurado. Llama a setTenantId() primero.');
    }
  }

  // ===== MÉTODOS DE TICKETS =====

  /**
   * Obtiene un ticket por ID
   */
  getTicketById(id: string): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.get<ApiResponse<ITicket>>(`tickets/${id}`).pipe(
      map(response => response)
    );
  }

  /**
   * Obtiene un ticket por número
   */
  getTicketByNumber(ticketNumber: string, companyId: string): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.get<ApiResponse<ITicket>>(
      `tickets/number/${ticketNumber}`,
      { companyId }
    ).pipe(
      map(response => response)
    );
  }

  /**
   * Lista tickets por compañía con filtros opcionales
   */
  getTickets(params: TicketQueryDto): Observable<ApiPaginatedResponse<ITicket>> {
    this.ensureTenantId();

    const queryParams: any = { ...params };

    // Asegurar valores por defecto
    if (!queryParams.limit) queryParams.limit = 20;
    if (!queryParams.offset) queryParams.offset = 0;
    if (!queryParams.sortField) queryParams.sortField = 'createdAt';
    if (!queryParams.sortDirection) queryParams.sortDirection = 'DESC';

    return this.get<ApiPaginatedResponse<ITicket>>('tickets', queryParams).pipe(
      map(response => response)
    );
  }

  /**
   * Lista tickets por compañía (método simplificado)
   */
  getTicketsByCompany(companyId: string): Observable<ApiResponse<ITicket[]>> {
    this.ensureTenantId();
    return this.get<ApiResponse<ITicket[]>>(`tickets/company/${companyId}`).pipe(
      map(response => response)
    );
  }

  /**
   * Crea un ticket (en estado DRAFT)
   */
  createTicket(dto: ICreateTicketDto): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.post<ApiResponse<ITicket>>('tickets', dto).pipe(
      map(response => response)
    );
  }

  /**
   * Crea y emite un ticket directamente (en estado ISSUED)
   */
  createAndIssueTicket(dto: ICreateTicketDto): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.post<ApiResponse<ITicket>>('tickets/create-and-issue', dto).pipe(
      map(response => response)
    );
  }

  /**
   * Emite un ticket en estado DRAFT
   */
  issueTicket(id: string): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.post<ApiResponse<ITicket>>(`tickets/${id}/issue`, {}).pipe(
      map(response => response)
    );
  }

  /**
   * Cancela un ticket
   */
  cancelTicket(id: string, reason?: string): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    const dto: ICancelTicketDto = { reason };
    return this.post<ApiResponse<ITicket>>(`tickets/${id}/cancel`, dto).pipe(
      map(response => response)
    );
  }

  /**
   * Convierte un ticket a boleta/DTE
   */
  convertToBoleta(id: string): Observable<ApiResponse<IConvertToBoletaResult>> {
    this.ensureTenantId();
    return this.post<ApiResponse<IConvertToBoletaResult>>(
      `tickets/${id}/convert-to-boleta`,
      {}
    ).pipe(
      map(response => response)
    );
  }

  /**
   * Actualiza un ticket (solo en estado DRAFT)
   */
  updateTicket(id: string, dto: Partial<ICreateTicketDto>): Observable<ApiResponse<ITicket>> {
    this.ensureTenantId();
    return this.put<ApiResponse<ITicket>>(`tickets/${id}`, dto).pipe(
      map(response => response)
    );
  }

  /**
   * Elimina un ticket (solo en estado DRAFT)
   */
  deleteTicket(id: string): Observable<ApiResponse<void>> {
    this.ensureTenantId();
    return this.delete<ApiResponse<void>>(`tickets/${id}`).pipe(
      map(response => response)
    );
  }
}
