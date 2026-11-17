import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../core/models/usuario.interface.js';
import { AuthService } from '../../core/services/auth.service.js';
import { PerfilService } from '../../core/services/perfil.service.js';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos del usuario.
  usuario = signal<Usuario | null>(null);

  cargando = signal(true);
  guardando = signal(false);

  // Separamos los errores de carga de los errores al guardar.
  errorCarga = signal('');
  error = signal('');
  mensaje = signal('');

  // Formulario reactivo con las validaciones de cada campo.
  perfilForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]],
    email: ['', [Validators.required, Validators.email]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(300)]],
  });

  // Archivo de imagen seleccionado por el usuario.
  imagenSeleccionada: File | null = null;

  ngOnInit(): void {
    // Al entrar, cargamos los datos actuales.
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.perfilService.obtener().subscribe({
      next: (usuario) => {
        // Guardamos los datos recibidos del backend.
        this.usuario.set(usuario);

        // Copiamos los datos recibidos al formulario reactivo.
        this.perfilForm.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          username: usuario.username,
          email: usuario.email,
          fechaNacimiento: usuario.fechaNacimiento?.slice(0, 10) ?? '',
          descripcion: usuario.descripcion ?? '',
        });

        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el perfil.');
        this.cargando.set(false);
      },
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.error.set('');

    if (!archivo) {
      this.imagenSeleccionada = null;
      return;
    }

    // Comprobamos que la imagen no supere los 5 MB.
    if (archivo.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede superar los 5 MB.');
      input.value = '';
      this.imagenSeleccionada = null;
      return;
    }

    // Verificamos que la imagen sea de un formato permitido.
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.error.set('Solo se admiten imagenes JPG, PNG o WebP.');
      input.value = '';
      this.imagenSeleccionada = null;
      return;
    }

    this.imagenSeleccionada = archivo;
  }

  guardarDatos(): void {
    // Evitamos enviar otra peticion mientras se esta guardando.
    if (this.guardando()) return;

    // Si el formulario es invalido, mostramos los errores de los campos.
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const valores = this.perfilForm.getRawValue();

    const datos = new FormData();

    // Agregamos los campos del formulario.
    datos.append('nombre', valores.nombre!.trim());
    datos.append('apellido', valores.apellido!.trim());
    datos.append('username', valores.username!.trim());
    datos.append('email', valores.email!.trim());
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', (valores.descripcion ?? '').trim());

    // La imagen es opcional.
    if (this.imagenSeleccionada) {
      datos.append('imagenPerfil', this.imagenSeleccionada);
    }

    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.perfilService.actualizar(datos).subscribe({
      next: (usuario) => {
        // Actualizamos los datos del usuario recibidos del backend.
        this.usuario.set(usuario);
        this.authService.actualizarUsuario(usuario);

        this.imagenSeleccionada = null;
        this.guardando.set(false);

        // Volvemos al perfil solamente si la actualizacion fue exitosa.
        this.router.navigate(['/perfil']);
      },
      error: (error) => {
        // Traducimos los errores de validacion del backend al espanol.
        const detalle = error?.error?.message;

        if (Array.isArray(detalle)) {
          const mensajes = detalle.map((mensaje: string) => {
            const texto = mensaje.toLowerCase();

            if (texto.includes('username')) {
              return 'El nombre de usuario debe tener entre 3 y 30 caracteres.';
            }

            if (texto.includes('apellido')) {
              return 'El apellido debe tener al menos 3 caracteres.';
            }

            if (texto.includes('nombre')) {
              return 'El nombre debe tener al menos 3 caracteres.';
            }

            if (texto.includes('email')) {
              return 'Ingresa un correo electronico valido.';
            }

            if (texto.includes('fechanacimiento')) {
              return 'Ingresa una fecha de nacimiento valida.';
            }

            if (texto.includes('descripcion')) {
              return 'La descripcion no puede superar los 300 caracteres.';
            }

            return 'Uno o mas campos contienen datos invalidos.';
          });

          this.error.set([...new Set(mensajes)].join(' '));
        } else {
          this.error.set(
            'No se pudieron guardar los cambios. Revisa los datos e intenta nuevamente.'
          );
        }

        // Finalizamos el estado de carga sin abandonar la pantalla de edicion.
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    // Volvemos al perfil.
    this.router.navigate(['/perfil']);
  }
}
