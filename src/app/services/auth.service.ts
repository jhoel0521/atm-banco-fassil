// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env.constants'; // Aquí importas la configuración del URL base

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = ENV.URL_BANCO_FASSIL;

  constructor(private http: HttpClient) {}

  // Método para hacer login
  login(credentials: { cardNumber: string; pin: string }): Observable<any> {
    const url = `${this.baseUrl}${ENV.LOGIN}`;
    
    // Agregar el token al encabezado
    const headers = new HttpHeaders({
      'X-Mi-Token': 'Bearer 5b51e16dc9e1ed7be92319aa77c3859051d2507bc9620ee85ff7e2f0ffb66b17'
    });

    // Hacer la solicitud POST al endpoint de login
    return this.http.post(url, credentials, { headers });
  }

  // Otros métodos de la API como obtener "me", "accounts", etc., con token en el encabezado
  getMe(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}${ENV.ME}`, { headers });
  }
  
  // Agregar otros métodos aquí para obtener cuentas, transacciones, etc.
}
