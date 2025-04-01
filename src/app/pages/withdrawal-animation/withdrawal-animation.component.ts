import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CountdownModule } from 'ngx-countdown';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-withdrawal-animation',
  standalone: true,
  imports: [CommonModule, CountdownModule],
  templateUrl: './withdrawal-animation.component.html',
  styleUrls: ['./withdrawal-animation.component.css']
})
export class WithdrawalAnimationComponent implements OnInit, OnDestroy {
  amount: number = 0;
  bills: number[] = [];
  isAnimating: boolean = true;
  countdown: number = 10;
  countdownInterval: any;
  showContinueButton: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.amount = +params['amount'] || 0;
      this.bills = history.state?.bills || this.calculateBills(this.amount);
    });

    // Animación de 3 segundos
    setTimeout(() => {
      this.isAnimating = false;
      this.showContinueButton = true;
      this.startCountdown();
    }, 3000);
  }

  calculateBills(amount: number): number[] {
    const denominations = [200, 100, 50, 20];
    const bills = [];
    let remaining = amount;

    for (const denom of denominations) {
      while (remaining >= denom) {
        bills.push(denom);
        remaining -= denom;
      }
    }
    return bills;
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
          this.authService.logout().subscribe({
            complete: () => {
              this.redirectToLogin();
            }
          });
      }
    }, 1000);
  }

  continue() {
    clearInterval(this.countdownInterval);
    this.redirectToDashboard();
  }

  redirectToDashboard() {
    this.router.navigate(['/dashboard']);
  }
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}