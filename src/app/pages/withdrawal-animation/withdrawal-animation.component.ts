import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-withdrawal-animation',
  standalone: true,
  imports: [CommonModule], // Agrega CommonModule aquí
  templateUrl: './withdrawal-animation.component.html',
  styleUrls: ['./withdrawal-animation.component.css']
})
export class WithdrawalAnimationComponent implements OnInit {
  amount: number = 0;
  accountId: number = 0;
  bills: number[] = [];
  isAnimating: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.amount = +params['amount'] || 0;
      this.accountId = +params['account'] || 0;
    });

    this.bills = history.state?.bills || [];

    setTimeout(() => {
      this.isAnimating = false;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 3000);
    }, 5000);
  }
}