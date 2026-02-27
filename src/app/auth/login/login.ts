import { UnitsService } from '../../dashboard/units/services/units.service';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../auth';
import { Tracking } from '../../core/tracking';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  public loginForm: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private auth: Auth,
    private tracking: Tracking,
    private unitsService: UnitsService
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        localStorage.setItem('access_token', response.access_token);
        this.tracking.connect(response.access_token);

        this.unitsService.units$.subscribe(units => {
          if (!units?.length) return;
          units.forEach(unit => this.tracking.joinUnit(unit.id));
        });

        this.unitsService.loadMyUnits();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas');
      }
    });
  }
}
