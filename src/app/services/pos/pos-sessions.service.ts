import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../api/base-api.service';
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
export class POSSessionsService extends BaseApiService<
  POSSessionResponseDto,
  OpenPOSSessionDto,
  never
> {
  protected override endpoint = 'pos/sessions';

  /**
   * Abrir nueva sesión
   */
  openSession(dto: OpenPOSSessionDto): Observable<POSSessionResponseDto> {
    return this.create(dto);
  }

  /**
   * Obtener sesiones abiertas
   */
  getOpenSessions(): Observable<POSSessionResponseDto[]> {
    return this.http.get<POSSessionResponseDto[]>(
      `${this.apiUrl}/${this.endpoint}/open`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estadísticas de sesiones
   */
  getSessionsStats(startDate?: string, endDate?: string): Observable<POSSessionsStatsDto> {
    let url = `${this.apiUrl}/${this.endpoint}/stats`;
    const params: string[] = [];

    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<POSSessionsStatsDto>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtener sesión abierta de un terminal específico
   */
  getOpenSessionByTerminal(terminalId: string): Observable<POSSessionResponseDto | null> {
    return this.http.get<POSSessionResponseDto | null>(
      `${this.apiUrl}/${this.endpoint}/terminal/${terminalId}/open`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cerrar sesión
   */
  closeSession(id: string, dto: ClosePOSSessionDto): Observable<POSSessionResponseDto> {
    return this.http.patch<POSSessionResponseDto>(
      `${this.apiUrl}/${this.endpoint}/${id}/close`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Listar sesiones con filtros (override para agregar tipado específico)
   */
  override list(query?: POSSessionQueryDto): Observable<PaginatedResponse<POSSessionResponseDto>> {
    return super.list(query);
  }
}
