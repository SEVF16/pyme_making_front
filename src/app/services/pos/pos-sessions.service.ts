import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import {
  POSSessionResponseDto,
  OpenPOSSessionDto,
  ClosePOSSessionDto,
  POSSessionQueryDto,
  POSSessionsStatsDto
} from '../../interfaces/pos.interfaces';
import { PaginatedResponse } from '../../interfaces/common.interfaces';

@Injectable({
  providedIn: 'root'
})
export class POSSessionsService extends BaseApiService {
  private tenantId: string | null = null;
  private endpoint = 'pos/sessions';

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
   * Abrir nueva sesión
   */
  openSession(dto: OpenPOSSessionDto): Observable<POSSessionResponseDto> {
    this.ensureTenantId();
    return this.post<POSSessionResponseDto>(this.endpoint, dto);
  }

  /**
   * Obtener sesiones abiertas
   */
  getOpenSessions(): Observable<POSSessionResponseDto[]> {
    this.ensureTenantId();
    return this.get<POSSessionResponseDto[]>(`${this.endpoint}/open`);
  }

  /**
   * Obtener estadísticas de sesiones
   */
  getSessionsStats(startDate?: string, endDate?: string): Observable<POSSessionsStatsDto> {
    this.ensureTenantId();
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.get<POSSessionsStatsDto>(`${this.endpoint}/stats`, params);
  }

  /**
   * Obtener sesión abierta de un terminal específico
   */
  getOpenSessionByTerminal(terminalId: string): Observable<POSSessionResponseDto | null> {
    this.ensureTenantId();
    return this.get<POSSessionResponseDto | null>(`${this.endpoint}/terminal/${terminalId}/open`);
  }

  /**
   * Cerrar sesión
   */
  closeSession(id: string, dto: ClosePOSSessionDto): Observable<POSSessionResponseDto> {
    this.ensureTenantId();
    return this.patch<POSSessionResponseDto>(`${this.endpoint}/${id}/close`, dto);
  }

  /**
   * Listar sesiones con filtros
   */
  list(query?: POSSessionQueryDto): Observable<PaginatedResponse<POSSessionResponseDto>> {
    this.ensureTenantId();
    return this.get<PaginatedResponse<POSSessionResponseDto>>(this.endpoint, query);
  }

  /**
   * Obtener sesión por ID
   */
  getById(id: string): Observable<POSSessionResponseDto> {
    this.ensureTenantId();
    return this.get<POSSessionResponseDto>(`${this.endpoint}/${id}`);
  }
}
