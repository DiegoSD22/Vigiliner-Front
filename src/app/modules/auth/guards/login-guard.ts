import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

/**
 * Login Guard (Funcional)
 * Previene acceso a rutas de autenticación si ya estás logueado
 * - Si estás autenticado: Redirige al dashboard
 * - Si no estás autenticado: Permite acceder a login/register/etc
 */
export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    const role = auth.getPrimaryRole();
    const destination = role === 'super-admin' ? '/super-dashboard' : '/dashboard';
    router.navigate([destination]);
    return false;
  }

  return true;
};
