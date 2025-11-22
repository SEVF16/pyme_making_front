// purchase-orders.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BaseApiService } from '../base-api.service';

import {
  PurchaseOrderResponseDto,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderItemDto,
  SubmitForApprovalDto,
  ApprovePurchaseOrderDto,
  SendToSupplierDto,
  ReceiveItemDto,
  CancelPurchaseOrderDto,
  PurchaseOrderQueryDto,
  PurchaseOrderStatsDto,
  ApiResponse,
  PaginatedResponse
} from '../../interfaces/purchase-order.interfaces';
import { HeadersService } from '../headers.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService extends BaseApiService {
  private tenantId: string | null = null;

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

  // ==================== CRUD OPERATIONS ====================

  /**
   * Crear una nueva orden de compra
   */
  createPurchaseOrder(purchaseOrder: CreatePurchaseOrderDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.post<ApiResponse<PurchaseOrderResponseDto>>('purchase-orders', purchaseOrder);
  }

  /**
   * Obtener todas las órdenes de compra con paginación y filtros
   */
  getPurchaseOrders(query?: PurchaseOrderQueryDto): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    const params = this.buildQueryParams(query);
    return this.get<PaginatedResponse<PurchaseOrderResponseDto>>('purchase-orders', params);
  }

  /**
   * Obtener una orden de compra por ID
   */
  getPurchaseOrderById(id: string): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.get<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}`);
  }

  /**
   * Actualizar una orden de compra (solo en estado DRAFT)
   */
  updatePurchaseOrder(id: string, purchaseOrder: UpdatePurchaseOrderDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}`, purchaseOrder);
  }

  /**
   * Eliminar una orden de compra (solo en estado DRAFT)
   */
  deletePurchaseOrder(id: string): Observable<ApiResponse<void>> {
    this.ensureTenantId();
    return this.delete<ApiResponse<void>>(`purchase-orders/${id}`);
  }

  // ==================== ITEM OPERATIONS ====================

  /**
   * Agregar un ítem a la orden de compra
   */
  addItem(orderId: string, item: UpdatePurchaseOrderItemDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.post<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${orderId}/items`, item);
  }

  /**
   * Actualizar un ítem de la orden de compra
   */
  updateItem(orderId: string, itemId: string, item: UpdatePurchaseOrderItemDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${orderId}/items/${itemId}`, item);
  }

  /**
   * Eliminar un ítem de la orden de compra
   */
  deleteItem(orderId: string, itemId: string): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.delete<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${orderId}/items/${itemId}`);
  }

  // ==================== WORKFLOW OPERATIONS ====================

  /**
   * Enviar orden a aprobación (DRAFT → PENDING_APPROVAL)
   */
  submitForApproval(id: string, dto: SubmitForApprovalDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}/submit`, dto);
  }

  /**
   * Aprobar orden (PENDING_APPROVAL → APPROVED)
   */
  approvePurchaseOrder(id: string, dto: ApprovePurchaseOrderDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}/approve`, dto);
  }

  /**
   * Enviar orden al proveedor (APPROVED → SENT_TO_SUPPLIER)
   */
  sendToSupplier(id: string, dto: SendToSupplierDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}/send`, dto);
  }

  /**
   * Recibir ítems de la orden
   * SENT_TO_SUPPLIER → PARTIALLY_RECEIVED → RECEIVED
   */
  receiveItems(id: string, dto: ReceiveItemDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}/receive`, dto);
  }

  /**
   * Cancelar orden de compra
   */
  cancelPurchaseOrder(id: string, dto: CancelPurchaseOrderDto): Observable<ApiResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.patch<ApiResponse<PurchaseOrderResponseDto>>(`purchase-orders/${id}/cancel`, dto);
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Obtener estadísticas de órdenes de compra
   */
  getStats(fromDate?: Date, toDate?: Date): Observable<ApiResponse<PurchaseOrderStatsDto>> {
    this.ensureTenantId();
    const params: any = {};
    if (fromDate) params['fromDate'] = fromDate.toISOString();
    if (toDate) params['toDate'] = toDate.toISOString();
    return this.get<ApiResponse<PurchaseOrderStatsDto>>('purchase-orders/stats', params);
  }

  /**
   * Obtener órdenes por estado
   */
  getPurchaseOrdersByStatus(status: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.getPurchaseOrders({ status: status as any, page, limit });
  }

  /**
   * Obtener órdenes pendientes de aprobación
   */
  getPendingApproval(page: number = 1, limit: number = 10): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.getPurchaseOrdersByStatus('PENDING_APPROVAL', page, limit);
  }

  /**
   * Obtener órdenes pendientes de recepción
   */
  getPendingReceipt(page: number = 1, limit: number = 10): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    const params: any = {
      page,
      limit,
      status: 'SENT_TO_SUPPLIER,PARTIALLY_RECEIVED' // Multiple statuses
    };
    return this.get<PaginatedResponse<PurchaseOrderResponseDto>>('purchase-orders', params);
  }

  /**
   * Obtener órdenes de un proveedor específico
   */
  getPurchaseOrdersBySupplier(supplierId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.getPurchaseOrders({ supplierId, page, limit });
  }

  /**
   * Buscar órdenes por número
   */
  searchByOrderNumber(orderNumber: string): Observable<PaginatedResponse<PurchaseOrderResponseDto>> {
    this.ensureTenantId();
    return this.getPurchaseOrders({ orderNumber, limit: 50 });
  }

  // ==================== UTILITIES ====================

  /**
   * Construye los parámetros de query desde el DTO
   */
  private buildQueryParams(query?: PurchaseOrderQueryDto): any {
    if (!query) return {};

    const params: any = {};

    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.limit !== undefined) params['limit'] = query.limit.toString();
    if (query.status) params['status'] = query.status;
    if (query.type) params['type'] = query.type;
    if (query.supplierId) params['supplierId'] = query.supplierId;
    if (query.orderNumber) params['orderNumber'] = query.orderNumber;
    if (query.fromDate) params['fromDate'] = query.fromDate.toString();
    if (query.toDate) params['toDate'] = query.toDate.toString();
    if (query.minAmount !== undefined) params['minAmount'] = query.minAmount.toString();
    if (query.maxAmount !== undefined) params['maxAmount'] = query.maxAmount.toString();
    if (query.sortBy) params['sortBy'] = query.sortBy;
    if (query.sortOrder) params['sortOrder'] = query.sortOrder;

    return params;
  }
}
