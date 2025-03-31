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
        return false; // Denegar acceso
      }
    }),
    catchError((error) => {
      console.error('Error verificando autenticación:', error);
      router.navigate(['/login']); // Redirigir en caso de error
      return of(false); // Denegar acceso
    })
  );
};
