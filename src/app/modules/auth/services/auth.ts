import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/interfaces/api-response.interface';
import { LoginResponseData, LoginResult, RegisterRequest } from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class Auth {
    private isRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === 'object' && value !== null;
    }

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.API_URL}/api/v1/auth`;

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const normalized = atob(base64);
      return JSON.parse(normalized) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private roleFromJwt(token: string | null): string | null {
    if (!token) {
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return null;
    }

    const directRole = payload['role'];
    if (typeof directRole === 'string') {
      return directRole;
    }

    const primaryRole = payload['primaryRole'];
    if (typeof primaryRole === 'string') {
      return primaryRole;
    }

    const roles = payload['roles'];
    if (Array.isArray(roles) && typeof roles[0] === 'string') {
      return roles[0];
    }

    return null;
  }

  private roleFromResponse(response: unknown): string | null {
    if (!this.isRecord(response)) {
      return null;
    }

    // Priorizar primaryRole si existe en la respuesta
    if (typeof response['primaryRole'] === 'string') {
      return response['primaryRole'].trim();
    }

    const directUser = response['user'];
    const nestedData = response['data'];
    const rawUser = this.isRecord(directUser)
      ? directUser
      : this.isRecord(nestedData) && this.isRecord(nestedData['user'])
        ? nestedData['user']
        : null;

    // Priorizar primaryRole del data si existe
    if (this.isRecord(nestedData) && typeof nestedData['primaryRole'] === 'string') {
      return nestedData['primaryRole'].trim();
    }

    if (typeof response['role'] === 'string') {
      return response['role'].trim();
    }

    if (this.isRecord(rawUser) && typeof rawUser['role'] === 'string') {
      return rawUser['role'].trim();
    }

    if (this.isRecord(rawUser) && Array.isArray(rawUser['roles']) && typeof rawUser['roles'][0] === 'string') {
      return rawUser['roles'][0].trim();
    }

    if (this.isRecord(rawUser) && typeof rawUser['username'] === 'string') {
      const username = rawUser['username'].trim().toLowerCase();
      if (username === 'super-admin' || username === 'admin') {
        return username;
      }
    }

    const tokenFromData = this.isRecord(nestedData) ? nestedData['accessToken'] : null;
    const tokenCandidate = response['accessToken'] ?? response['access_token'] ?? tokenFromData;
    return this.roleFromJwt(typeof tokenCandidate === 'string' ? tokenCandidate : null);
  }

  login(identifier: string, password: string): Observable<LoginResult> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.apiUrl}/login`, { identifier, password })
      .pipe(
        map((response) => ({
          user: response.data.user,
          accessToken: response.data.accessToken,
          tokenType: response.data.tokenType,
          roles: response.data.roles,
          permissions: response.data.permissions,
          primaryRole: response.data.primaryRole,
          message: typeof response.message === 'string' ? response.message : undefined,
        })),
        tap((result) => {
          localStorage.setItem('access_token', result.accessToken);

          const role = this.roleFromResponse(result);
          if (role) {
            localStorage.setItem('user_role', role);
          }

          // Guardar primaryRole si existe
          if (result.primaryRole) {
            localStorage.setItem('primary_role', result.primaryRole);
          }

          // Guardar roles si existen
          if (result.roles && Array.isArray(result.roles)) {
            localStorage.setItem('user_roles', JSON.stringify(result.roles));
          }

          // Guardar permisos si existen
          if (result.permissions && Array.isArray(result.permissions)) {
            localStorage.setItem('user_permissions', JSON.stringify(result.permissions));
          }
        })
      );
  }

  register(name: string, email: string, password: string): Observable<ApiResponse<unknown>> {
    const payload: RegisterRequest = { name, email, password };
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

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('primary_role');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('user_permissions');
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getUserRole(response?: unknown): string | null {
    const roleFromApi = response ? this.roleFromResponse(response) : null;
    if (roleFromApi) {
      return roleFromApi;
    }

    const tokenRole = this.roleFromJwt(this.getToken());
    if (tokenRole) {
      return tokenRole;
    }

    const cachedRole = localStorage.getItem('user_role');
    return cachedRole || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}