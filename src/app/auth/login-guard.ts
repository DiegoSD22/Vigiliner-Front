import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const access_token = localStorage.getItem('access_token');

  if (access_token) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
