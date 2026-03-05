import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Tracking } from '../../../../core/tracking';
import { UnitsService } from '../../../dashboard/units/services/units.service';
import { filter, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public showPassword = signal(false);

  public loginForm: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private auth: Auth,
    private tracking: Tracking,
    private unitsService: UnitsService
  ) {
    const savedIdentifier = localStorage.getItem('rememberedIdentifier');
    
    this.loginForm = this.fb.group({
      identifier: [savedIdentifier || '', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [!!savedIdentifier],
    });
  }

  get identifierControl() {
    return this.loginForm.get('identifier');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  login() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password, rememberMe } = this.loginForm.getRawValue();

    if (rememberMe) {
      localStorage.setItem('rememberedIdentifier', identifier);
    } else {
      localStorage.removeItem('rememberedIdentifier');
    }

    this.auth.login(identifier, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        this.tracking.connect(response.accessToken);

        this.unitsService.loadMyUnits();

        this.unitsService.units$
          .pipe(
            filter((units) => !!units?.length),
            take(1)
          )
          .subscribe((units) => {
            units.forEach((unit) => this.tracking.joinUnit(unit.id));
          });

        const role = this.auth.getUserRole(response);
        this.router.navigate([role === 'super-admin' ? '/super-dashboard' : '/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getBackendErrorMessage(error));
      }
    });
  }

  private getBackendErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
    }

    const payload = error.error;
    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }

      if (Array.isArray(payload.message) && payload.message.length > 0) {
        const firstMessage = payload.message.find((item: unknown) => typeof item === 'string');
        if (typeof firstMessage === 'string' && firstMessage.trim()) {
          return firstMessage;
        }
      }

      if (payload.errors && typeof payload.errors === 'object') {
        const firstFieldErrors = Object.values(payload.errors).find((value) => Array.isArray(value)) as unknown[] | undefined;
        const firstFieldMessage = firstFieldErrors?.find((value) => typeof value === 'string');
        if (typeof firstFieldMessage === 'string' && firstFieldMessage.trim()) {
          return firstFieldMessage;
        }
      }
    }

    if (error.status === 401) {
      return 'Credenciales inválidas';
    }

    return 'No fue posible iniciar sesión. Intenta nuevamente.';
  }
}
