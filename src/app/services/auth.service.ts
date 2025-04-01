import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { ENV } from '../env.constants';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

export class TokenError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'TokenError';
    this.code = code;
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
  type: 'W' | 'D' | 'T';
  previousBalance: string;
  newBalance: string;
  amount: string;
  commentSystem: string;
  description: string;
  accountId: number;
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

  // Método para obtener el token con manejo de errores
  getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new TokenError(
        'No se encontró token de autenticación. Redirigiendo a login.',
        'AUTH_SERVICE_NO_TOKEN'
      );
    }
    return token;
  }

  // Método para establecer headers con token
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'X-Mi-Token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  login(credentials: { cardNumber: string; pin: string }): Observable<ApiResponse<LoginResponseData>> {
    const url = `${this.baseUrl}${ENV.LOGIN}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<LoginResponseData>>(url, credentials, { headers }).pipe(
      catchError(error => {
        throw new TokenError(
          'Error en las credenciales de acceso',
          'AUTH_SERVICE_LOGIN_FAILED'
        );
      })
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getMe(): Observable<ApiResponse<User>> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<ApiResponse<User>>(`${this.baseUrl}${ENV.ME}`, {}, { headers }).pipe(
        catchError(error => {
          if (error.status === 0) {
            throw new TokenError(
              'Error de conexión con el servidor',
              'AUTH_SERVICE_CONNECTION_ERROR'
            );
          }
          throw new TokenError(
            'Error al obtener información del usuario',
            'AUTH_SERVICE_ME_FAILED'
          );
        })
      );
    } catch (error) {
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of({ success: false });
    }
  }

  isAuthenticated(): Observable<boolean> {
    try {
      // Verificamos primero que exista token
      this.getToken();

      return this.getMe().pipe(
        map(response => response.success),
        catchError(error => {
          if (error instanceof TokenError) {
            this.handleTokenError(error);
          }
          return of(false);
        })
      );
    } catch (error) {
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of(false);
    }
  }

  checkAuthenticationAndRedirect(redirectToLogin: boolean = true): void {
    this.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        if (!isAuthenticated && redirectToLogin) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error al verificar autenticación:', error);
        if (redirectToLogin) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  public clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('time');
    localStorage.removeItem('user');
  }

  public getAccounts(): Observable<ApiResponse<AccountsResponse>> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<ApiResponse<AccountsResponse>>(
        `${this.baseUrl}${ENV.ACCOUNTS}`,
        { headers }
      ).pipe(
        catchError(error => {
          throw new TokenError(
            'Error al obtener cuentas',
            'AUTH_SERVICE_GET_ACCOUNTS_FAILED'
          );
        })
      );
    } catch (error) {
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of({ success: false });
    }
  }

  public withdraw(accountId: number, amount: number): Observable<ApiResponse<any>> {
    try {
      const headers = this.getAuthHeaders();
      const body = {
        amount: amount,
        account_id: accountId
      };

      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}${ENV.ACCOUNT_WITHDRAW}`,
        body,
        { headers }
      ).pipe(
        catchError(error => {
          throw new TokenError(
            'Error al realizar retiro',
            'AUTH_SERVICE_WITHDRAW_FAILED'
          );
        })
      );
    } catch (error) {
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of({ success: false });
    }
  }

  public getTransactions(accountId: number, to: string, from: string): Observable<ApiResponse<TransactionsResponse>> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<ApiResponse<TransactionsResponse>>(
        `${this.baseUrl}${ENV.TRANSACTIONS}?idAccount=${accountId}&to=${to}&from=${from}`,
        { headers }
      ).pipe(
        catchError(error => {
          throw new TokenError(
            'Error al obtener transacciones',
            'AUTH_SERVICE_GET_TRANSACTIONS_FAILED'
          );
        })
      );
    } catch (error) {
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of({ success: false });
    }
  }

  public logout(): Observable<ApiResponse<any>> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}${ENV.LOGOUT}`,
        {},
        { headers }
      ).pipe(
        map(response => {
          this.clearLocalStorage();
          return response;
        }),
        catchError(error => {
          this.clearLocalStorage();
          throw new TokenError(
            'Error al cerrar sesión',
            'AUTH_SERVICE_LOGOUT_FAILED'
          );
        })
      );
    } catch (error) {
      this.clearLocalStorage();
      if (error instanceof TokenError) {
        this.handleTokenError(error);
      }
      return of({ success: false });
    }
  }

  private handleTokenError(error: TokenError): void {
    console.error(`[${error.code}] ${error.message}`);
    this.clearLocalStorage();
    this.router.navigate(['/login']);
  }
}