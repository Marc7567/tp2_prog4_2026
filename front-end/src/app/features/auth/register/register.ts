import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service.js';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
    repetirPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: [''],
  });

  imagenPerfil: File | null = null;
  nombreImagen = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  contrasenasCoinciden(): boolean {
    const password = this.registroForm.controls.password.value;
    const repetirPassword = this.registroForm.controls.repetirPassword.value;

    return !!password && password === repetirPassword;
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.imagenPerfil = archivo;
    this.nombreImagen.set(archivo?.name ?? '');
  }

  onSubmit(): void {
    if (this.registroForm.invalid || !this.contrasenasCoinciden()) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const valores = this.registroForm.getRawValue();
    const datos = new FormData();

    datos.append('nombre', valores.nombre!.trim());
    datos.append('apellido', valores.apellido!.trim());
    datos.append('username', valores.username!.trim());
    datos.append('email', valores.email!.trim());
    datos.append('password', valores.password!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion ?? '');

    if (this.imagenPerfil) {
      datos.append('imagenPerfil', this.imagenPerfil);
    }

    this.authService.signUp(datos).subscribe({
      // Se ejecuta cuando el registro finaliza correctamente.
      next: (respuesta) => {
        const usuario = {
          ...respuesta.usuario,
          // adapatamos el campo a id. (campo utilizado en el front)
          id: respuesta.usuario.id ?? respuesta.usuario._id
        };

        // guardamos el token JWT y los datos del usuario
        // en el localStorage.
        this.authService.iniciarSesion(
          respuesta.access_token, usuario
        );

        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },

      //En caso de que se rechaze el registro o ocurre un error.
      error: (error) => {
        // Dejamos de mostrar el indicador de carga.
        this.isLoading.set(false);

        // mostramos el mensaje de error
        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'No se pudo crear la cuenta. Revisa los datos e intenta nuevamente.'
        );
      },
    });
  }
}
