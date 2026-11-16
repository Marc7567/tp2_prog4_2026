import { Component, OnInit, inject } from '@angular/core';
import { ChildrenOutletContexts, Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header.js';
import { Footer } from './layout/footer/footer.js';
import { AuthService } from './core/services/auth.service.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  constructor(private contexts: ChildrenOutletContexts) {}

  ngOnInit(): void {
    this.auth.restaurarSesion().subscribe((usuario) => {
      if (usuario) {
        void this.router.navigate(['/home']);
      } else {
        void this.router.navigate(['/login']);
      }
    });
  }

  renovarSesion(): void {
    this.auth.renovarSesion().subscribe({
      error: () => {
        this.auth.signOut();
        void this.router.navigate(['/login']);
      },
    });
  }

  cerrarSesion(): void {
    this.auth.signOut();
    void this.router.navigate(['/login']);
  }

  continuarSesion(): void {
    this.auth.mostrarRenovacion.set(false);
  }
}
