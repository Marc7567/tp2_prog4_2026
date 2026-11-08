import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})

export class Footer {
  readonly anioActual = new Date().getFullYear();
}
