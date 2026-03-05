import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

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

    const roles = payload['roles'];
    if (Array.isArray(roles) && typeof roles[0] === 'string') {
      return roles[0];
    }

    return null;
  }

  private roleFromResponse(response: any): string | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    if (typeof response.role === 'string') {
      return response.role;
    }

    if (response.user && typeof response.user.role === 'string') {
      return response.user.role;
    }

    return this.roleFromJwt(response.access_token ?? null);
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((response) => {
        localStorage.setItem('access_token', response.access_token);

        const role = this.roleFromResponse(response);
        if (role) {
          localStorage.setItem('user_role', role);
        }
      }));
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, password });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, password: newPassword });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resend-verification`, { email });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, { 
      currentPassword, 
      newPassword 
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getUserRole(response?: any): string | null {
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