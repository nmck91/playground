import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `,
  styles: ``,
})
export class App {
  protected title = 'last-player-standing';
}
