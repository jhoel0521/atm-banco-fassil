import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Account {
  id: number;
  currentBalance: string;
  type: string;
  status: string;
  personId: number;
  officeId: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  currentDate = new Date();
  quickAmounts = [100, 200, 500, 1000];
  customAmount: number = 0;
  transactionMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadAccounts();
  }

  private loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  private loadAccounts() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getAccounts(token).subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.accounts = response.data.accounts;
            if (this.accounts.length > 0) {
              this.selectedAccount = this.accounts[0];
            }
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading accounts:', err);
          this.isLoading = false;
        }
      });
    }
  }

  selectAccount(account: Account) {
    this.selectedAccount = account;
  }

  withdraw(amount: number) {
    if (!this.selectedAccount) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoading = true;
    this.authService.withdraw(token, this.selectedAccount.id, amount).subscribe({
      next: (response: any) => {
        this.transactionMessage = 'Retiro exitoso!';
        this.loadAccounts(); // Actualizar saldos
        this.isLoading = false;
        setTimeout(() => this.transactionMessage = null, 3000);
      },
      error: (err) => {
        this.transactionMessage = 'Error en el retiro: ' + (err.error?.message || 'Error desconocido');
        this.isLoading = false;
        setTimeout(() => this.transactionMessage = null, 5000);
      }
    });
  }

  withdrawCustom() {
    if (this.customAmount > 0 && this.selectedAccount) {
      this.withdraw(this.customAmount);
      this.customAmount = 0;
    }
  }

  formatBalance(balance: string): number {
    return parseFloat(balance);
  }

  getAccountTypeName(type: string): string {
    return type === 'CA' ? 'Cuenta Ahorros' : 'Cuenta Corriente';
  }

  logout() {
    this.authService.clearLocalStorage();
    this.router.navigate(['/login']);
  }
}