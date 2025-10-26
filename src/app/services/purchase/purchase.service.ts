import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import {
  Purchase,
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PurchaseQueryParams,
  PaymentMethod
} from '../../interfaces/purchase/purchase.interfaces';
import { ApiResponse, ApiPaginatedResponse } from '../../interfaces/api-response.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService extends BaseApiService {
  private readonly endpoint = 'purchases';
  private readonly paymentMethodsEndpoint = 'payment-methods';

  /**
   * Obtiene todas las compras con parametros de consulta
   */
  getPurchases(params?: PurchaseQueryParams): Observable<ApiPaginatedResponse<Purchase>> {
    return this.get<ApiPaginatedResponse<Purchase>>(this.endpoint, params);
  }

  /**
   * Obtiene una compra por ID
   */
  getPurchaseById(id: string): Observable<ApiResponse<Purchase>> {
    return this.get<ApiResponse<Purchase>>(`${this.endpoint}/${id}`);
  }

  /**
   * Crea una nueva compra
   */
  createPurchase(purchase: CreatePurchaseDto): Observable<ApiResponse<Purchase>> {
    return this.post<ApiResponse<Purchase>>(this.endpoint, purchase);
  }

  /**
   * Actualiza una compra existente
   */
  updatePurchase(id: string, purchase: UpdatePurchaseDto): Observable<ApiResponse<Purchase>> {
    return this.put<ApiResponse<Purchase>>(`${this.endpoint}/${id}`, purchase);
  }

  /**
   * Elimina una compra
   */
  deletePurchase(id: string): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  /**
   * Completa una compra (cambia estado a completed)
   */
  completePurchase(id: string): Observable<ApiResponse<Purchase>> {
    return this.patch<ApiResponse<Purchase>>(`${this.endpoint}/${id}/complete`, {});
  }

  /**
   * Cancela una compra (cambia estado a cancelled)
   */
  cancelPurchase(id: string): Observable<ApiResponse<Purchase>> {
    return this.patch<ApiResponse<Purchase>>(`${this.endpoint}/${id}/cancel`, {});
  }

  /**
   * Obtiene todos los metodos de pago disponibles
   */
  getPaymentMethods(): Observable<ApiResponse<PaymentMethod[]>> {
    return this.get<ApiResponse<PaymentMethod[]>>(this.paymentMethodsEndpoint);
  }

  /**
   * Obtiene los metodos de pago activos
   */
  getActivePaymentMethods(): Observable<ApiResponse<PaymentMethod[]>> {
    return this.get<ApiResponse<PaymentMethod[]>>(`${this.paymentMethodsEndpoint}/active`);
  }
}
