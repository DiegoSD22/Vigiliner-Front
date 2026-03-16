import { Component, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './verify-email-page.html',
  styleUrl: './verify-email-page.css',
})
export class VerifyEmailPage implements OnInit {

  public isLoading = signal(true);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  public isResending = signal(false);
  public resendSuccess = signal<string | null>(null);
  public resendError = signal<string | null>(null);

  public resendForm: FormGroup;

  private token: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private auth: Auth
  ) {
    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.isLoading.set(false);
      this.errorMessage.set('Token de verificacion invalido o no proporcionado.');
      return;
    }

    this.verifyEmail();
  }

  verifyEmail() {
    this.auth.verifyEmail(this.token).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Correo verificado exitosamente! Redirigiendo al inicio de sesion...');

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Error al verificar el correo. El token puede haber expirado.');
      }
    });
  }

  get emailControl() {
    return this.resendForm.get('email');
  }

  resendVerification() {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.isResending.set(true);
    this.resendError.set(null);
    this.resendSuccess.set(null);

    const { email } = this.resendForm.getRawValue();

    this.auth.resendVerificationEmail(email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.resendSuccess.set('Te hemos enviado un nuevo correo de verificacion. Revisa tu bandeja de entrada.');
        this.resendForm.reset();
      },
      error: (error) => {
        this.isResending.set(false);
        this.resendError.set(error.error?.message || 'Error al enviar el correo. Intenta nuevamente.');
      }
    });
  }
}
