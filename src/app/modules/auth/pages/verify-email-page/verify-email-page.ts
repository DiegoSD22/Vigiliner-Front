import { Component, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './verify-email-page.html',
  styleUrl: './verify-email-page.css',
})
export class VerifyEmailPage implements OnInit {

  public isLoading = signal(true);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  private token: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      this.isLoading.set(false);
      this.errorMessage.set('Token de verificacion invalido.');
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
}
