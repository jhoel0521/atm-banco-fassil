import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { ENV } from '../env.constants'; // Aquí importas la configuración del URL base
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}
export interface Account {
  id: number;
  currentBalance: string;
  type: string;
  status: string;
  personId: number;
  officeId: number;
}
export interface AccountsResponse {
  accounts: Account[];
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
export interface Transaction {
  id: number;
  created_at: string;
  updated_at: string;
  type: 'W' | 'D' | 'T'; // W: Withdrawal, D: Deposit, T: Transfer
  previousBalance: string;
  newBalance: string;
  amount: string;
  commentSystem: string;
  description: string;
  accountId: number;
}
export interface AccountsResponse {
  accounts: Account[];
}
export interface TransactionsResponse {
  message: string;
  accounts: {
    id: number;
    transactions: Transaction[];
  }[];
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
    localStorage.setItem('token', token); // Guarda el token en el almacenamiento local
  }

  // Otros métodos de la API como obtener "me", "accounts", etc., con token en el encabezado
  getMe(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Asegúrate de incluir un "body", aunque esté vacío
    const body = {};

    return this.http.post(`${this.baseUrl}${ENV.ME}`, body, { headers }).pipe(
      catchError((error) => {
        if (error.status === 0) {
          console.error('Error de CORS o problema de conexión');
        } else {
          console.error('Error al obtener "me":', error);
        }
        return of(null); // Regresa null o maneja el error de forma adecuada
      })
    );
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
            console.log('Usuario autenticado');
            return true; // Usuario autenticado
          } else {
            console.warn('Usuario no autenticado');
            this.clearLocalStorage();
            return false; // Usuario no autenticado
          }
        }),
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

  public clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('time');
    localStorage.removeItem('user');
  }
  public getAccounts(token: string): Observable<ApiResponse<AccountsResponse>> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<ApiResponse<AccountsResponse>>(
      `${this.baseUrl}${ENV.ACCOUNTS}`,
      { headers }
    );
  }
  public withdraw(token: string, accountId: number, amount: number): Observable<any> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      amount: amount,
      account_id: accountId
    };

    return this.http.post(
      `${this.baseUrl}${ENV.ACCOUNT_WITHDRAW}`,
      body,
      { headers }
    );
  }
  public getTransactions(token: string, accountId: number, to: string, from: string): Observable<ApiResponse<TransactionsResponse>> {
    const headers = new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    

    return this.http.get<ApiResponse<TransactionsResponse>>(
      `${this.baseUrl}${ENV.TRANSACTIONS}?idAccount=${accountId}&to=${to}&from=${from}`,
      { headers }
    );
  }
}
