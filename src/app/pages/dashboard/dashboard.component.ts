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
    this.authService.getAccounts().subscribe({
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
  public getTransactions() {

  }
  selectAccount(account: Account) {
    this.selectedAccount = account;
    this.loadTransactions();
  }

  // Agrega este método para calcular los billetes
  private calculateBills(amount: number): number[] {
    const denominations = [200, 100, 50, 20, 10];
    const bills = [];
    let remaining = amount;

    for (const denom of denominations) {
      const count = Math.floor(remaining / denom);
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          bills.push(denom);
        }
        remaining = remaining % denom;
      }
    }
    return bills;
  }

  // Modifica el método withdraw existente
  withdraw(amount: number) {
    if (!this.selectedAccount) return;


    this.isLoading = true;
    this.authService.withdraw(this.selectedAccount.id, amount).subscribe({
      next: (response: any) => {
        // Redirige a la página de animación con los datos
        this.router.navigate(['/withdrawal-animation'], {
          queryParams: {
            amount: amount,
            account: this.selectedAccount?.id
          },
          state: {
            bills: this.calculateBills(amount),
            transactionData: response
          }
        });
      },
      error: (err) => {
        // Manejo de errores...
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
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
        this.router.navigate(['/login']);
      },
      complete: () => {
        console.log('Logout completado');
      }
    });
  }
  loadTransactions() {
    if (!this.selectedAccount) return;


    const today = new Date();
    // yyyy-mm-dd
    const now = today.toISOString().split('T')[0];
    console.log('Fecha actual:', now);
    this.isLoading = true;
    this.authService.getTransactions(
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