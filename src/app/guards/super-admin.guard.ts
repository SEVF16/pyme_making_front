// super-admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que solo deben ser accesibles por Super Admins
 *
 * Verifica que:
 * 1. El usuario esté autenticado
 * 2. El usuario tenga rol 'super-admin'
 *
 * Si no cumple, redirige a /companies o /login según corresponda
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    map(authState => {
      // Verificar si está autenticado
      if (!authState.isAuthenticated || !authState.user) {
        router.navigate(['/login']);
        return false;
      }

      // Verificar si tiene rol super-admin
      if (authState.user.role === 'super-admin') {
        return true;
      }

      // Si no es super-admin, redirigir a companies
      console.warn('Acceso denegado: Se requiere rol super-admin');
      router.navigate(['/companies']);
      return false;
    })
  );
};
