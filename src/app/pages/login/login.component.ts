// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  cardNumber: string = '';
  pin: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }
  isCardNumberValid(): boolean {
    const cardNumberRegex = /^\d{4,16}$/;
    return cardNumberRegex.test(this.cardNumber);
  }

  // Método para validar el PIN
  isPinValid(): boolean {
    const pinRegex = /^\d{4}$/;
    return pinRegex.test(this.pin);
  }
  onLogin() {
    console.log('Intentando iniciar sesión con:', this.cardNumber, this.pin);
    const loginData = {
      cardNumber: this.cardNumber,
      pin: this.pin
    };
    if (!loginData.cardNumber || !loginData.pin) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }
    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('Login exitoso:', response);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('time', JSON.stringify(new Date()));
          this.router.navigate(['/dashboard']); // Redirigir al usuario
        } else {
          console.error('Error en el login: Respuesta sin datos válidos');
          this.errorMessage = 'Hubo un problema con la autenticación';
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        if (err.status === 401 && err.error?.data?.message) {
          this.errorMessage = err.error.data.message;
        }
        else if (err.error?.message) {
          this.errorMessage = err.error.message;
        }
        else {
          this.errorMessage = 'Número de tarjeta o PIN incorrectos';
        }
      }
    });

  }

}
