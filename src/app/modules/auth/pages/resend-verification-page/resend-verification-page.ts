import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './resend-verification-page.html',
  styleUrl: './resend-verification-page.css',
})
export class ResendVerificationPage {

  public isLoading = signal(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  public resendForm: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: Auth
  ) {
    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email } = this.resendForm.getRawValue();

    this.auth.resendVerificationEmail(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Te hemos enviado un nuevo correo de verificacion. Revisa tu bandeja de entrada.');
        this.resendForm.reset();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Error al enviar el correo. Intenta nuevamente.');
      }
    });
  }
}
