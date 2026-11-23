import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../core/services/usuarios.service.js';
import type { CrearUsuarioAdmin, UsuarioAdmin } from '../../../core/models/usuarios-admin.interface.js';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})

export class Usuarios implements OnInit {
  private usuariosService = inject(UsuariosService);

  @ViewChild('inputImagen')
  inputImagen?: ElementRef<HTMLInputElement>;

  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mensaje = signal('');
  error = signal('');

  repetirPassword = '';
  imagenPerfil: File | null = null;
  nombreImagen = signal('');

  formulario: CrearUsuarioAdmin = this.formularioVacio();

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private formularioVacio(): CrearUsuarioAdmin {
    return {
      nombre: '',
      apellido: '',
      username: '',
      email: '',
      password: '',
      fechaNacimiento: '',
      descripcion: '',
      rol: 'usuario'
    }
  }

  contrasenasCoinciden(): boolean {
    return !!this.formulario.password &&
      this.formulario.password === this.repetirPassword
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.imagenPerfil = archivo;
    this.nombreImagen.set(archivo?.name ?? '');
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuariosService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message ?? 'No se pudieron cargar los usuarios.'
        );
        this.cargando.set(false);
      }
    })
  }

  crearUsuario(): void {
    this.mensaje.set('');
    this.error.set('');

    const password = this.formulario.password;
    const passwordValida =
      password.length >= 8 && password.length <= 72 &&
      /^(?=.*[A-Z])(?=.*\d).+$/.test(password);

    if (
      !this.formulario.nombre.trim() ||
      !this.formulario.apellido.trim() ||
      !this.formulario.username.trim() ||
      !this.formulario.email.trim() ||
      !password ||
      !this.formulario.fechaNacimiento
    ) {
      this.error.set('Completa todos los campos .');
      return;
    }

    if (!passwordValida) {
      this.error.set(
        'La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero.',
      );
      return;
    }

    if (!this.contrasenasCoinciden()) {
      this.error.set('Las contrasenas no coinciden.');
      return;
    }

    this.guardando.set(true);

    const datos = new FormData();
    datos.append('nombre', this.formulario.nombre.trim());
    datos.append('apellido', this.formulario.apellido.trim());
    datos.append('username', this.formulario.username.trim());
    datos.append('email', this.formulario.email.trim().toLowerCase());
    datos.append('password', password);
    datos.append('fechaNacimiento', this.formulario.fechaNacimiento);
    datos.append('descripcion', this.formulario.descripcion.trim());
    datos.append('rol', this.formulario.rol);

    if (this.imagenPerfil) {
      datos.append('imagenPerfil', this.imagenPerfil);
    }

    this.usuariosService.crearUsuario(datos).subscribe({
      next: () => {
        this.mensaje.set('Usuario creado correctamente.');
        this.formulario = this.formularioVacio();
        this.repetirPassword = '';
        this.imagenPerfil = null;
        this.nombreImagen.set('');

        if (this.inputImagen) {
          this.inputImagen.nativeElement.value = '';
        }

        this.guardando.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.error.set(
          Array.isArray(err.error?.message)
            ? err.error.message.join(', ')
            : err.error?.message ?? 'No se pudo crear el usuario.'
        );
        this.guardando.set(false);
      },
    });
  }

  cambiarEstado(usuario: UsuarioAdmin): void {
    this.error.set('');
    this.mensaje.set('');

    const peticion = usuario.habilitado
      ? this.usuariosService.deshabilitarUsuario(usuario._id)
      : this.usuariosService.habilitarUsuario(usuario._id);

    peticion.subscribe({
      next: () => {
        this.mensaje.set(
          usuario.habilitado
            ? 'Usuario deshabilitado correctamente.'
            : 'Usuario habilitado correctamente.'
        );
        this.cargarUsuarios();
      },
      error: (err) => {
        this.error.set(
          err.error?.message ?? 'No se pudo cambiar el estado del usuario.'
        );
      }
    })
  }
}
