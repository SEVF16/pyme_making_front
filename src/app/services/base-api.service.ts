// base-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/development';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly baseUrl = environment.apiUrl;

  constructor(
    protected http: HttpClient,
    protected headersService: HeadersService
  ) {}

  // Métodos genéricos que automáticamente usan los headers centralizados
  protected get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    const headers = this.getHeaders();
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { 
      params: httpParams,
      headers 
    });
  }

  protected post<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  protected put<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  protected delete<T>(endpoint: string): Observable<T> {
    const headers = this.getHeaders();
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { headers });
  }

  protected patch<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Obtener headers con tenant-id
  private getHeaders(): HttpHeaders {
    const allHeaders = this.headersService.getHeaders();
    let httpHeaders = new HttpHeaders();

    Object.keys(allHeaders).forEach(key => {
      httpHeaders = httpHeaders.set(key, allHeaders[key]);
    });

    return httpHeaders;
  }
}