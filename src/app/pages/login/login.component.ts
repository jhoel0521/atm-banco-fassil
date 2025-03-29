// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    FormsModule 
  ]
})
export class LoginComponent {
  cardNumber: string = '';
  pin: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    const loginData = {
      cardNumber: this.cardNumber,
      pin: this.pin
    };
  
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
        this.errorMessage = 'Número de tarjeta o PIN incorrectos';
      }
    });
  }
  
}
