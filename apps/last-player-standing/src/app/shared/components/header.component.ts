import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  authService = inject(AuthService);
  router = inject(Router);

  async logout() {
    await this.authService.signOut();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
