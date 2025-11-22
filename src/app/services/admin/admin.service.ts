// admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { HeadersService } from '../headers.service';
import {
  Plan,
  CreatePlanDto,
  UpdatePlanDto,
  Company,
  CompanyListItem,
  CreateCompanyWithPlanDto,
  UpdateCompanyStatusDto,
  AssignPlanDto,
  ExtendSubscriptionDto,
  Subscription,
  CompanyDashboard,
  MetricsOverview,
  FilterCompaniesDto,
  PaginatedResponse
} from '../../interfaces/admin';

/**
 * Servicio para gestión administrativa del sistema (Super Admin)
 *
 * IMPORTANTE: Este servicio NO requiere X-Tenant-ID ya que es para
 * usuarios con rol 'super-admin' que gestionan TODO el sistema.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseApiService {
  private endpoint = 'admin';

  constructor(
    override http: HttpClient,
    override headersService: HeadersService
  ) {
    super(http, headersService);
  }

  // ==================== PLANES ====================

  /**
   * Crear nuevo plan de suscripción
   */
  createPlan(dto: CreatePlanDto): Observable<Plan> {
    return this.post<Plan>(`${this.endpoint}/plans`, dto);
  }

  /**
   * Listar todos los planes activos
   */
  getPlans(): Observable<Plan[]> {
    return this.get<Plan[]>(`${this.endpoint}/plans`);
  }

  /**
   * Obtener plan por ID
   */
  getPlanById(id: string): Observable<Plan> {
    return this.get<Plan>(`${this.endpoint}/plans/${id}`);
  }

  /**
   * Actualizar plan existente
   */
  updatePlan(id: string, dto: UpdatePlanDto): Observable<Plan> {
    return this.put<Plan>(`${this.endpoint}/plans/${id}`, dto);
  }

  // ==================== EMPRESAS ====================

  /**
   * Crear empresa completa con plan y admin inicial
   */
  createCompany(dto: CreateCompanyWithPlanDto): Observable<{
    company: Company;
    subscription: Subscription;
    adminUser: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }> {
    return this.post(`${this.endpoint}/companies`, dto);
  }

  /**
   * Listar empresas con filtros y paginación
   */
  getCompanies(filters?: FilterCompaniesDto): Observable<PaginatedResponse<CompanyListItem>> {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.planId) params.planId = filters.planId;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    return this.get<PaginatedResponse<CompanyListItem>>(`${this.endpoint}/companies`, params);
  }

  /**
   * Obtener dashboard completo de una empresa
   */
  getCompanyDashboard(id: string): Observable<CompanyDashboard> {
    return this.get<CompanyDashboard>(`${this.endpoint}/companies/${id}/dashboard`);
  }

  /**
   * Cambiar estado de una empresa
   */
  updateCompanyStatus(id: string, dto: UpdateCompanyStatusDto): Observable<Company> {
    return this.put<Company>(`${this.endpoint}/companies/${id}/status`, dto);
  }

  /**
   * Asignar o cambiar plan de una empresa
   */
  assignPlan(id: string, dto: AssignPlanDto): Observable<Subscription> {
    return this.put<Subscription>(`${this.endpoint}/companies/${id}/plan`, dto);
  }

  /**
   * Extender suscripción de una empresa
   */
  extendSubscription(id: string, dto: ExtendSubscriptionDto): Observable<Subscription> {
    return this.put<Subscription>(`${this.endpoint}/companies/${id}/subscription/extend`, dto);
  }

  // ==================== MÉTRICAS ====================

  /**
   * Obtener métricas globales del SaaS
   */
  getMetricsOverview(): Observable<MetricsOverview> {
    return this.get<MetricsOverview>(`${this.endpoint}/metrics/overview`);
  }
}
