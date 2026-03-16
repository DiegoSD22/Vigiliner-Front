import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '@vigiliner/env/environment';
import { ApiResponse } from '@vigiliner/core/interfaces/api-response.interface';
import { LoginResponseDto, LoginResultDto, RegisterRequestDto } from '@vigiliner/shared/dtos/auth';
import { StorageService } from '@vigiliner/shared/services/storage.service';

/**
 * Servicio de autenticación
 * Responsabilidades: Comunicación HTTP con backend
 * El manejo de roles y storage está abstraído
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly apiUrl = `${environment.API_URL}/api/v1/auth`;

  /**
   * Login del usuario
   * Maneja: HTTP request → transformación → persistencia segura
   */
  login(identifier: string, password: string): Observable<LoginResultDto> {
    return this.http
      .post<ApiResponse<LoginResponseDto>>(`${this.apiUrl}/login`, { identifier, password })
      .pipe(
        map((response) => ({
          user: response.data.user,
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType,
          roles: response.data.roles,
          permissions: response.data.permissions,
          primaryRole: response.data.primaryRole,
          requiresMfa: response.data.requiresMfa,
          mfaToken: response.data.mfaToken,
          message: typeof response.message === 'string' ? response.message : undefined,
        })),
        tap((result) => {
          if (!result.requiresMfa) {
            this.persistLoginData(result);
          }
        })
      );
  }

  /**
   * Persiste los datos de login de forma segura
   * Aislada: fácil cambiar storage strategy
   */
  private persistLoginData(result: LoginResponseDto): void {
    this.storage.set('access_token', result.accessToken);

    if (result.primaryRole) {
      this.storage.set('primary_role', result.primaryRole);
    }

    if (result.roles && Array.isArray(result.roles)) {
      this.storage.set('user_roles', result.roles);
    }

    if (result.permissions && Array.isArray(result.permissions)) {
      this.storage.set('user_permissions', result.permissions);
    }
  }


  verifyMfaOtp(mfaToken: string, otp: string): Observable<LoginResultDto> {
    return this.http
      .post<ApiResponse<LoginResponseDto>>(`${this.apiUrl}/verify-mfa`, { mfaToken, otp })
      .pipe(
        map((response) => ({ ...response.data, message: typeof response.message === 'string' ? response.message : undefined })),
        tap((result) => this.persistLoginData(result))
      );
  }

  register(name: string, email: string, password: string): Observable<ApiResponse<unknown>> {
    const payload: RegisterRequestDto = { name, email, password };
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/register`, payload);
  }

  forgotPassword(email: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/reset-password`, { token, password: newPassword });
  }

  verifyEmail(token: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerificationEmail(email: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/resend-verification`, { email });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/change-password`, {
      currentPassword, 
      newPassword 
    });
  }

  /**
   * Cierra sesión del usuario
   * Limpia todo el storage de autenticación
   */
  logout(): void {
    this.storage.remove('access_token');
    this.storage.remove('primary_role');
    this.storage.remove('user_roles');
    this.storage.remove('user_permissions');
  }

  /**
   * Obtiene el token de acceso actual
   */
  getToken(): string | null {
    return this.storage.get('access_token');
  }

  /**
   * Obtiene el rol primario desde la respuesta de login o del storage
   */
  getPrimaryRole(): string | null {
    return this.storage.get('primary_role');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}