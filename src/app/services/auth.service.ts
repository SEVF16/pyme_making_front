import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HeadersService } from './headers.service';
import { isPlatformBrowser } from '@angular/common';

// ===== INTERFACES PRINCIPALES =====
export interface LoginRequest {
  email: string;
  password: string;
  companyId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number | null;
  message: string | null;
  timestamp: string;
  path?: string;
}

export interface LoginData {
  access_token: string;
  user: User;
  tenant_id: string;
  expires_in: string;
}

export interface LoginResponse extends ApiResponse<LoginData> {
  // Esta interfaz ahora extiende la estructura general de la API
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  companyId?: string;
  tenant_id?: string;
  company?: Company;
  permissions?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Para campos adicionales
}

export interface Company {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ===== INTERFACES ADICIONALES PARA FUNCIONALIDADES COMPLETAS =====

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenData {
  token: string;
  user: User;
  refreshToken?: string;
}

export interface RefreshTokenResponse extends ApiResponse<RefreshTokenData> {
  // Respuesta del refresh token
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse extends ApiResponse<any> {
  // Respuesta del cambio de contraseña
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse extends ApiResponse<any> {
  // Respuesta de solicitud de reset
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse extends ApiResponse<any> {
  // Respuesta del reset de contraseña
}

// ===== SERVICIO DE AUTENTICACIÓN =====
@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {
  // Estado reactivo de autenticación
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  // Getters para acceso directo al estado
  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get authToken(): string | null {
    return this.authStateSubject.value.token;
  }

  get isLoading(): boolean {
    return this.authStateSubject.value.loading;
  }

  constructor(
    override http: HttpClient,
    override headersService: HeadersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(http, headersService);
    // Solo inicializar si estamos en el navegador
    if (this.isBrowser()) {
      this.initializeAuth();
    }
  }

  /**
   * Verificar si estamos en el navegador
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  private initializeAuth(): void {
    if (!this.isBrowser()) {
      return;
    }

    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.setAuthData(user, token);
    }
  }

  /**
   * Login del usuario - Corregido para manejar la estructura real de la API
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    this.clearError();

    return this.post<any>('auth/login', credentials).pipe(
      tap(response => {
        
        // Verificar si la respuesta tiene el formato esperado
        if (response.success && response.data) {
          const { access_token, user, tenant_id, expires_in } = response.data;
          
          if (access_token && user) {
            
            this.handleLoginSuccess(user, access_token);
          } else {
            this.handleLoginError('Datos de autenticación incompletos');
          }
        } else {

          this.handleLoginError('Formato de respuesta inválido');
        }
      }),
      catchError(error => {

        this.handleLoginError(this.extractErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => {

        this.setLoading(false);
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): Observable<LogoutResponse> {
    this.setLoading(true);

    return this.post<ApiResponse<any>>('auth/logout', {}).pipe(
      map(response => ({ success: response.success, message: response.message || 'Sesión cerrada' })),
      tap(() => this.handleLogoutSuccess()),
      catchError(error => {
        // Aunque falle el logout en el servidor, limpiamos localmente
        this.handleLogoutSuccess();
        return of({ success: true, message: 'Sesión cerrada localmente' });
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Refrescar token de autenticación
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.post<RefreshTokenResponse>('auth/refresh-token', refreshRequest).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleLoginSuccess(
            response.data.user, 
            response.data.token, 
            response.data.refreshToken
          );
        }
      }),
      catchError(error => {
        this.handleLogoutSuccess(); // Si falla el refresh, desloguear
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<boolean> {
    if (!this.authToken) {
      return of(false);
    }

    return this.get<VerifyTokenResponse>('auth/verify-token').pipe(
      map(response => response.valid),
      catchError(() => {
        this.handleLogoutSuccess();
        return of(false);
      })
    );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<User> {
    return this.get<ApiResponse<User>>('auth/profile').pipe(
      map(response => response.data),
      tap(user => {
        this.updateAuthState({ user });
      })
    );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<ChangePasswordResponse> {
    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword,
      newPassword
    };

    return this.post<ChangePasswordResponse>('auth/change-password', changePasswordRequest);
  }

  /**
   * Solicitar reset de contraseña
   */
  requestPasswordReset(email: string): Observable<ForgotPasswordResponse> {
    const request: ForgotPasswordRequest = { email };
    return this.post<ForgotPasswordResponse>('auth/forgot-password', request);
  }

  /**
   * Reset de contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<ResetPasswordResponse> {
    const request: ResetPasswordRequest = { token, newPassword };
    return this.post<ResetPasswordResponse>('auth/reset-password', request);
  }

  // ===== MÉTODOS PRIVADOS PARA MANEJO INTERNO =====

  private handleLoginSuccess(user: User, token: string, refreshToken?: string): void {
      if (user.tenant_id) {
    localStorage.setItem('tenant_id', user.tenant_id);
  } else if (user.companyId) {
    localStorage.setItem('tenant_id', user.companyId);
  }
    this.setAuthData(user, token, refreshToken);
    this.clearError();
  }

  private handleLoginError(error: string): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      error
    });
    this.clearStorage();
  }

  private handleLogoutSuccess(): void {
    this.clearAuthData();
    this.clearStorage();
  }

  private setAuthData(user: User, token: string, refreshToken?: string): void {    
    // Establecer token en headers centralizados
    this.headersService.setAuthToken(token);
    
    // Guardar en localStorage
    this.storeAuthData(user, token, refreshToken);
    
    // Actualizar estado reactivo
    this.updateAuthState({
      isAuthenticated: true,
      user,
      token,
      error: null
    });

  }

  private clearAuthData(): void {
    // Remover token de headers centralizados
    this.headersService.removeAuthToken();
    
    // Actualizar estado reactivo
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null
    });
  }

  private updateAuthState(partial: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...partial });
  }

  private setLoading(loading: boolean): void {
    this.updateAuthState({ loading });
  }

  private clearError(): void {
    this.updateAuthState({ error: null });
  }

  // ===== MÉTODOS DE ALMACENAMIENTO LOCAL =====

  private storeAuthData(user: User, token: string, refreshToken?: string): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    } catch (error) {
      console.warn('Error storing auth data:', error);
    }
  }

  private getStoredToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Error getting stored token:', error);
      return null;
    }
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.warn('Error getting stored user:', error);
      return null;
    }
  }

  private getStoredRefreshToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return localStorage.getItem('refresh_token');
    } catch (error) {
      console.warn('Error getting stored refresh token:', error);
      return null;
    }
  }

  private clearStorage(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  }

  // ===== UTILIDADES =====

  /**
   * Obtener el nombre completo del usuario
   */
  getUserDisplayName(user: User): string {
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return user.email;
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Error desconocido';
  }
}