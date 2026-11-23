import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service.js';

@Directive({
  selector: '[appRole]',
  standalone: true
})

export class RoleDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly appRole = input.required<string>();

  constructor() {
    effect(() => {
      const usuario = this.authService.currentUser();
      const rolRequerido = this.appRole();
      const tienePermiso = usuario?.rol === rolRequerido;

      this.viewContainer.clear();

      if (tienePermiso) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
