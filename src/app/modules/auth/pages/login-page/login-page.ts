import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Tracking } from '../../../../core/tracking';
import { UnitsService } from '../../../dashboard/units/services/units.service';
import { filter, take } from 'rxjs';

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
    const savedEmail = localStorage.getItem('rememberedEmail');
    
    this.loginForm = this.fb.group({
      email: [savedEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [!!savedEmail],
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
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

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.auth.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        this.tracking.connect(response.access_token);

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
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas');
      }
    });
  }
}
