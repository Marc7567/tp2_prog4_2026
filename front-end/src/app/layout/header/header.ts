import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service.js';
import { RoleDirective } from '../../shared/directives/role.directive.js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RoleDirective],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.signOut();
    void this.router.navigate(['/login']);
  }
}
