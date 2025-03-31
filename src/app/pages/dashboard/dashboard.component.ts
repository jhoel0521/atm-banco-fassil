import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Transaction } from '../../services/auth.service';
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
  transactions: Transaction[] = [];
  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

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
              this.loadTransactions();
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
  public getTransactions() {

  }
  selectAccount(account: Account) {
    this.selectedAccount = account;
    this.loadTransactions();
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

  getFormat(cuenta: Account): string {
    const formattedId = cuenta.id.toString().padStart(8, '0');
    return (cuenta.type === 'CA' ? 'Cuenta Ahorros' : 'Cuenta Corriente') + ` #${cuenta.type}-${formattedId}`
  }

  logout() {
    this.authService.clearLocalStorage();
    this.router.navigate(['/login']);
  }
  loadTransactions() {
    if (!this.selectedAccount) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const today = new Date();
    // yyyy-mm-dd
    const now = today.toISOString().split('T')[0];
    console.log('Fecha actual:', now);
    this.isLoading = true;
    this.authService.getTransactions(
      token,
      this.selectedAccount.id,
      now,
      now,
    ).subscribe({
      next: (response: any) => {
        if (response?.success) {
          const accountData = response.data.accounts.find((acc: any) => acc.id === this.selectedAccount?.id);
          this.transactions = accountData?.transactions || [];
          console.log('Transactions:', this.transactions);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.transactions = [];
        this.isLoading = false;
      }
    });
  }

  formatTransactionType(type: string): string {
    switch (type) {
      case 'W': return 'Retiro';
      case 'D': return 'Depósito';
      case 'T': return 'Transferencia';
      default: return type;
    }
  }
}