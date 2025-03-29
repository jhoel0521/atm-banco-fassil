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
    // Crear el objeto de datos a enviar
    const loginData = {
      cardNumber: this.cardNumber,
      pin: this.pin
    };

    // Llamar al servicio de login
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/home']); // Redirigir al usuario después de login exitoso
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorMessage = 'Número de tarjeta o PIN incorrectos';
      }
    });
  }
}
