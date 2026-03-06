import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const currentRole = auth.getUserRole();

  if (!currentRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(currentRole)) {
    return true;
  }

  router.navigate([currentRole === 'super-admin' ? '/super-dashboard' : '/dashboard']);
  return false;
};
