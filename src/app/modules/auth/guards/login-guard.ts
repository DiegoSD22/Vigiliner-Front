import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    const role = auth.getUserRole();
    router.navigate([role === 'super-admin' ? '/super-dashboard' : '/dashboard']);
    return false;
  }

  return true;
};
