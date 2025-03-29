// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env.constants'; // Aquí importas la configuración del URL base
import { Router } from '@angular/router';
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

  constructor(private http: HttpClient,private router: Router) { }
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
      'X-Mi-Token': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}${ENV.ME}`, { headers });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token'); // Verifica si existe un token
    return !!token; // Retorna true si hay token, false si no
  }
  checkAuthenticationAndRedirect(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']); // Redirige a Dashboard si está autenticado
    } else {
      this.router.navigate(['/login']); // Redirige a Login si no está autenticado
    }
  }
}
