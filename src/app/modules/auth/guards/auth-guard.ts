import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}