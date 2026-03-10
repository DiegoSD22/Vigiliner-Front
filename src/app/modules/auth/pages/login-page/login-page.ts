import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import {
  NonNullableFormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

/**
 * LoginPage Component
 * Responsabilidad única: Renderizar y gestionar el formulario de login
 * OnPush: Optimizado para Angular 14+
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  // === Dependencias ===
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  // === Signals para estado reactivo ===
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  // === Template access ===
  loginForm: FormGroup;

  constructor() {
    const savedIdentifier = localStorage.getItem('rememberedIdentifier');

    this.loginForm = this.fb.group({
      identifier: [savedIdentifier || '', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [!!savedIdentifier],
    });
  }

  // === Getters para template ===
  get identifierControl() {
    return this.loginForm.get('identifier');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  // === Acciones del usuario ===

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password, rememberMe } = this.loginForm.getRawValue();

    // Persistir preferencia "Remember me"
    if (rememberMe) {
      localStorage.setItem('rememberedIdentifier', identifier);
    } else {
      localStorage.removeItem('rememberedIdentifier');
    }

    // Llamada al servidor
    this.auth
      .login(identifier, password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => this.handleLoginSuccess(result),
        error: (error: HttpErrorResponse) => this.handleLoginError(error),
      });
  }

  // === Handlers privados ===

  private handleLoginSuccess(result: { primaryRole?: string }): void {
    // Determinar destino basado en rol
    const role = result.primaryRole || 'admin';
    const destination = role === 'super-admin' ? '/super-dashboard' : '/dashboard';

    this.router.navigate([destination]);
  }

  private handleLoginError(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error);
    this.errorMessage.set(message);
  }

  /**
   * Extrae mensaje de error del response HTTP
   * Manejo robusto de múltiples formatos de respuesta
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    // Error de conexión
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
    }

    const payload = error.error;

    // Intenta extraer del formato estándar
    if (payload && typeof payload === 'object') {
      // message: string
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }

      // message: string[]
      if (Array.isArray(payload.message)) {
        const firstMessage = payload.message.find((item: unknown) => typeof item === 'string');
        if (typeof firstMessage === 'string' && firstMessage.trim()) {
          return firstMessage;
        }
      }

      // errors: { field: string[] }
      if (payload.errors && typeof payload.errors === 'object') {
        const firstFieldErrors = Object.values(payload.errors).find(
          (value) => Array.isArray(value)
        ) as unknown[] | undefined;
        const firstFieldMessage = firstFieldErrors?.find((value) => typeof value === 'string');
        if (typeof firstFieldMessage === 'string' && firstFieldMessage.trim()) {
          return firstFieldMessage;
        }
      }
    }

    // Errores HTTP conocidos
    if (error.status === 401) {
      return 'Credenciales inválidas. Verifica tu correo/usuario y contraseña.';
    }

    if (error.status === 429) {
      return 'Demasiados intentos de login. Intenta más tarde.';
    }

    // Fallback genérico
    return 'No fue posible iniciar sesión. Intenta nuevamente.';
  }
}
