import { Component } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header.js';
import { Footer } from './layout/footer/footer.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {
  constructor(private contexts: ChildrenOutletContexts) {}
}