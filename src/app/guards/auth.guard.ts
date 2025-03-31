import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyectar AuthService
  const router = inject(Router); // Inyectar Router

  return authService.isAuthenticated().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true; // Permitir acceso
      } else {
        return router.createUrlTree(['/login']); // Redirigir a la página de inicio de sesión
      }
    }),
    catchError((error) => {
      console.error('Error verificando autenticación:', error);
      return of(router.createUrlTree(['/login'])); // Redirigir a la página de inicio de sesión en caso de error
    })
  );
};
