import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { ENV } from '../env.constants';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

export class TokenError extends Error {
  constructor(override message: string, public code: string) {
    super(message);
    this.name = 'TokenError';
    Object.setPrototypeOf(this, TokenError.prototype);
  }
}

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

export interface User {
  id: number;
  username: string;
  personId: number;
  status: string;
}

export interface Transaction {
  id: number;
  created_at: string;
  updated_at: string;
  type: 'W' | 'D' | 'T';
  previousBalance: string;
  newBalance: string;
  amount: string;
  commentSystem: string;
  description: string;
  accountId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = ENV.URL_BANCO_FASSIL;

  constructor(private http: HttpClient, private router: Router) { }

  getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new TokenError('No se encontró token de autenticación', 'AUTH_SERVICE_NO_TOKEN');
    }
    return token;
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Mi-Token': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  login(credentials: { cardNumber: string; pin: string }): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.http.post<ApiResponse<{ token: string; user: User }>>(
      `${this.baseUrl}${ENV.LOGIN}`,
      credentials,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      catchError(() => { throw new TokenError('Error en credenciales', 'AUTH_SERVICE_LOGIN_FAILED'); })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getMe(): Observable<ApiResponse<User>> {
    try {
      return this.http.post<ApiResponse<User>>(
        `${this.baseUrl}${ENV.ME}`,
        {},
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(error => {
          const code = error.status === 0 ? 'AUTH_SERVICE_CONNECTION_ERROR' : 'AUTH_SERVICE_ME_FAILED';
          throw new TokenError('Error al obtener usuario', code);
        })
      );
    } catch (error) {
      this.handleError(error);
      return of({ success: false });
    }
  }

  isAuthenticated(): Observable<boolean> {
    try {
      this.getToken();
      return this.getMe().pipe(
        map(response => response.success),
        catchError(error => {
          this.handleError(error);
          return of(false);
        })
      );
    } catch (error) {
      this.handleError(error);
      return of(false);
    }
  }

  getAccounts(): Observable<ApiResponse<{ accounts: Account[] }>> {
    try {
      return this.http.get<ApiResponse<{ accounts: Account[] }>>(
        `${this.baseUrl}${ENV.ACCOUNTS}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(() => { throw new TokenError('Error al obtener cuentas', 'AUTH_SERVICE_GET_ACCOUNTS_FAILED'); })
      );
    } catch (error) {
      this.handleError(error);
      return of({ success: false });
    }
  }

  withdraw(accountId: number, amount: number): Observable<ApiResponse<any>> {
    try {
      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}${ENV.ACCOUNT_WITHDRAW}`,
        { amount, account_id: accountId },
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(() => { throw new TokenError('Error al retirar', 'AUTH_SERVICE_WITHDRAW_FAILED'); })
      );
    } catch (error) {
      this.handleError(error);
      return of({ success: false });
    }
  }

  getTransactions(accountId: number, to: string, from: string): Observable<ApiResponse<{ accounts: { id: number; transactions: Transaction[] }[] }>> {
    try {
      return this.http.get<ApiResponse<{ accounts: { id: number; transactions: Transaction[] }[] }>>(
        `${this.baseUrl}${ENV.TRANSACTIONS}?idAccount=${accountId}&to=${to}&from=${from}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(() => { throw new TokenError('Error al obtener transacciones', 'AUTH_SERVICE_GET_TRANSACTIONS_FAILED'); })
      );
    } catch (error) {
      this.handleError(error);
      return of({ success: false });
    }
  }

  logout(): Observable<ApiResponse<any>> {
    try {
      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}${ENV.LOGOUT}`,
        {},
        { headers: this.getAuthHeaders() }
      ).pipe(
        map(response => {
          this.clearLocalStorage();
          return response;
        }),
        catchError(error => {
          this.clearLocalStorage();
          throw new TokenError('Error al cerrar sesión', 'AUTH_SERVICE_LOGOUT_FAILED');
        })
      );
    } catch (error) {
      this.clearLocalStorage();
      this.handleError(error);
      return of({ success: false });
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('time');
    localStorage.removeItem('user');
  }

  private handleError(error: unknown): void {
    if (error instanceof TokenError) {
      console.error(`[${error.code}] ${error.message}`);
      this.clearLocalStorage();
      this.router.navigate(['/login']);
    }
  }
}