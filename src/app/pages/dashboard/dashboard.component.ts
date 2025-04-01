import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Transaction, Account as AuthAccount } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomAmountModalComponent } from '../../components/custom-amount-modal/custom-amount-modal.component';

interface Account extends AuthAccount {
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
  transactions: Transaction[] = [];
  currentDate = new Date();
  quickAmounts = [100, 200, 500, 1000];
  customAmount = 0;
  isLoading = false;
  transactionMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;
  }

  private loadAccounts(): void {
    this.isLoading = true;
    this.authService.getAccounts().subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          this.accounts = response.data.accounts as Account[];
          if (this.accounts.length > 0) {
            this.selectedAccount = this.accounts[0];
            this.loadTransactions();
          }
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.loadTransactions();
  }

  withdraw(amount: number): void {
    if (!this.selectedAccount) return;

    this.isLoading = true;
    this.authService.withdraw(this.selectedAccount.id, amount).subscribe({
      next: (response) => {
        this.transactionMessage = 'Retiro realizado con éxito';
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
        this.isLoading = false;
        if (err.status === 422 && err.error?.data?.message) {
          this.transactionMessage = err.error.data.message;
        }
        else if (err.error?.message) {
          this.transactionMessage = err.error.message;
        }
        else {
          this.transactionMessage = 'Error al realizar el retiro';
        }

        console.error('Error en retiro:', err);
      }
    });
  }

  withdrawCustom(): void {
    if (this.customAmount > 0 && this.selectedAccount) {
      this.withdraw(this.customAmount);
      this.customAmount = 0;
    }
  }

  private calculateBills(amount: number): number[] {
    const denominations = [200, 100, 50, 20, 10];
    const bills: number[] = [];
    let remaining = amount;

    denominations.forEach(denom => {
      const count = Math.floor(remaining / denom);
      if (count > 0) {
        bills.push(...Array(count).fill(denom));
        remaining %= denom;
      }
    });

    return bills;
  }

  loadTransactions(): void {
    if (!this.selectedAccount) return;

    this.isLoading = true;
    const today = this.currentDate.toISOString().split('T')[0];

    this.authService.getTransactions(this.selectedAccount.id, today, today).subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          const accountData = response.data.accounts.find(acc => acc.id === this.selectedAccount?.id);
          this.transactions = accountData?.transactions || [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.transactions = [];
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  formatBalance(balance: string): number {
    return parseFloat(balance);
  }

  getFormat(account: Account): string {
    const formattedId = account.id.toString().padStart(8, '0');
    return `${account.type === 'CA' ? 'Cuenta Ahorros' : 'Cuenta Corriente'} #${account.type}-${formattedId}`;
  }

  formatTransactionType(type: string): string {
    const types: Record<string, string> = {
      'W': 'Retiro',
      'D': 'Depósito',
      'T': 'Transferencia'
    };
    return types[type] || type;
  }

  clearTransactionMessage(): void {
    this.transactionMessage = null;
  }
  openCustomAmountModal(): void {
    const modalRef = this.modalService.open(CustomAmountModalComponent);
    modalRef.componentInstance.customAmount = this.customAmount;
    modalRef.componentInstance.isLoading = this.isLoading;
    modalRef.componentInstance.selectedAccount = this.selectedAccount;

    modalRef.result.then((result) => {
      if (result && result.amount) {
        this.withdraw(result.amount);
      }
    }).catch(() => {
      // Se ejecuta cuando el modal se cierra sin confirmar
    });
  }
}