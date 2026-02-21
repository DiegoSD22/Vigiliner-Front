import { UnitsService } from './../../units/units';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { FormsModule } from '@angular/forms';
import { Tracking } from '../../core/tracking';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';

  constructor(private router: Router, private auth: Auth, private tracking: Tracking, private UnitsService: UnitsService) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access_token);
        this.tracking.connect(response.access_token);
        this.UnitsService.units$.subscribe(units => {
          if (!units || units.length === 0) return;
        units.forEach(unit => {
          this.tracking.joinUnit(unit.id);
        });
      });
        this.UnitsService.loadMyUnits();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
      }
    });
  }
}