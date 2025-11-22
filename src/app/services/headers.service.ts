import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeadersService {
  private headers: { [key: string]: string } = {};

  constructor() {
    // Headers por defecto
    this.setDefaultHeaders();
  }

  private setDefaultHeaders(): void {
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  // Obtener todos los headers
  getHeaders(): { [key: string]: string } {
    return { ...this.headers };
  }

  // Establecer un header específico
  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  // Establecer múltiples headers
  setHeaders(headers: { [key: string]: string }): void {
    this.headers = { ...this.headers, ...headers };
  }

  // Remover un header específico
  removeHeader(key: string): void {
    delete this.headers[key];
  }

  // Establecer token de autorización
  setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  // Remover token de autorización
  removeAuthToken(): void {
    this.removeHeader('Authorization');
  }

  // Establecer tenant ID
  setTenantId(tenantId: string): void {
    this.setHeader('x-tenant-id', tenantId);
  }

  // Remover tenant ID
  removeTenantId(): void {
    this.removeHeader('x-tenant-id');
  }

  // Limpiar todos los headers (excepto los por defecto)
  clearHeaders(): void {
    this.setDefaultHeaders();
  }
}