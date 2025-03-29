// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { ENV } from '../env.constants'; // Aquí importas la configuración del URL base
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T; // El campo "data" es opcional, ya que podría no estar presente si "success" no es true
}

export interface User {
  id: number;
  username: string;
  personId: number;
  status: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = ENV.URL_BANCO_FASSIL;

  constructor(private http: HttpClient, private router: Router) { }
  // Método para hacer login
  login(credentials: { cardNumber: string; pin: string }): Observable<ApiResponse<LoginResponseData>> {
    const url = `${this.baseUrl}${ENV.LOGIN}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<LoginResponseData>>(url, credentials, { headers });
  }
  guardarToken(token: string): void {

  }
  // Otros métodos de la API como obtener "me", "accounts", etc., con token en el encabezado
  getMe(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log(`${this.baseUrl}${ENV.ME}`, { headers }, 'post');
    return this.http.post(`${this.baseUrl}${ENV.ME}`, { headers });
  }

  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No hay token');
      this.clearLocalStorage();
      return of(false); // No hay token, no autenticado
    }

    try {
      
      return this.getMe(token).pipe(
        map((response: any) => {
          if (response && response.success) {
            console.log('Usuario autenticado:', response.data);
            return true; // Usuario autenticado
          } else {
            console.warn('Usuario no autenticado');
            this.clearLocalStorage();
            return false; // Usuario no autenticado
          }
        }), // Mapear respuesta a booleano
        catchError((error) => {
          console.error('Error en el servidor:', error);
          return of(false); // Devolver false en caso de error
        })
      );
    } catch (error) {
      console.error('Error al contactar al servidor:', error);
      this.clearLocalStorage();
      return of(false); // Devolver false en caso de error
    }    
  }



  checkAuthenticationAndRedirect(): void {
    this.isAuthenticated().subscribe(
      (isAuthenticated) => {
        console.log('Verificando autenticación...');
        if (isAuthenticated) {
          console.log('Usuario autenticado, redirigiendo a dashboard');
          this.router.navigate(['/dashboard']);
        } else {
          console.warn('Usuario no autenticado, redirigiendo a login');
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        console.error('Error al verificar la autenticación:', error);
        this.router.navigate(['/login']); // Redirigir a login en caso de error
      }
    );
  }
  
  private clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('time');
    localStorage.removeItem('user');
  }

}
