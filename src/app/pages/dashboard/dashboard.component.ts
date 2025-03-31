import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agrega los módulos necesarios
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  account: any;
  currentDate = new Date();
  quickAmounts = [100, 200, 500, 1000];
  customAmount: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadAccountInfo();
  }

  private loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  private loadAccountInfo() {
    // Implementar lógica real para obtener datos de la cuenta
    this.account = {
      number: '1234 5678 9012 3456',
      balance: 15000.50,
      currency: 'USD'
    };
  }

  withdraw(amount: number) {
    console.log('Retirando:', amount);
    // Implementar lógica de retiro
  }

  withdrawCustom() {
    if (this.customAmount > 0) {
      this.withdraw(this.customAmount);
    }
  }

  logout() {
    this.authService.clearLocalStorage();
    this.router.navigate(['/login']);
  }
}