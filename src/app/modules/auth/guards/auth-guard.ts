import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

/**
 * Auth Guard (Funcional)
 * Protege rutas que requieren autenticación
 * - Si estás autenticado: Permite acceso
 * - Si no estás autenticado: Redirige a login
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};