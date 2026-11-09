import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    // validamos por email o usurname
    identificador: ['', [Validators.required]],
    password: ['', [Validators.required,
    Validators.minLength(8),
    Validators.maxLength(72),
    Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
    ]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
  
    const identificador = this.loginForm.controls.identificador.value?.trim() ?? '';
    const password = this.loginForm.controls.password.value ?? '';

    this.authService.signIn(identificador, password).subscribe({
      next: (sesion) => {
        this.authService.iniciarSesion(
          sesion.access_token,
          sesion.usuario
        );

        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'No se pudo iniciar sesion. Revisa tus datos.'
        );
        this.isLoading.set(false);
      },
    });
  }
}
