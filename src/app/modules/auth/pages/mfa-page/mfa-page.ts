import { Component, signal, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { finalize } from 'rxjs';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './mfa-page.html',
  styleUrl: './mfa-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfaPage implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Se lee durante la navegación (en campo de clase, antes de ngOnInit)
  private mfaToken: string =
    this.router.getCurrentNavigation()?.extras.state?.['mfaToken'] ??
    (window.history.state as Record<string, unknown>)?.['mfaToken'] ??
    '';

  readonly otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  get otpControl() {
    return this.otpForm.get('otp');
  }

  ngOnInit(): void {
    if (!this.mfaToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  verify(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { otp } = this.otpForm.getRawValue();

    this.auth
      .verifyMfaOtp(this.mfaToken, otp)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          const role = result.primaryRole || 'admin';
          const destination = role === 'super-admin' ? '/super-dashboard' : '/dashboard';
          this.router.navigate([destination]);
        },
        error: (error: HttpErrorResponse) => {
          const payload = error.error;
          const message =
            typeof payload?.message === 'string'
              ? payload.message
              : 'Codigo invalido o expirado. Intenta nuevamente.';
          this.errorMessage.set(message);
          this.otpForm.reset();
        },
      });
  }
}
