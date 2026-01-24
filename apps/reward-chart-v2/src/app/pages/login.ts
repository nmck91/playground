import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-brand-primary via-brand-accent to-brand-secondary flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 max-w-md w-full">
        <!-- Logo Section -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="text-5xl sm:text-6xl mb-3">&#127775;</div>
          <h1 class="text-2xl sm:text-3xl font-bold text-brand-primary mb-2">Family Reward Chart</h1>
          <p class="text-slate-600 text-sm sm:text-base">Two-way accountability for everyone!</p>
        </div>

        <!-- Login Form -->
        <div class="space-y-4 sm:space-y-5">
          <div>
            <label class="block text-sm sm:text-base font-semibold text-slate-900 mb-2">
              What's your name?
            </label>
            <input
              [(ngModel)]="name"
              type="text"
              placeholder="Enter your name"
              class="w-full px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors text-sm sm:text-base"
              (keyup.enter)="login()"
            />
          </div>

          <button
            (click)="login()"
            [disabled]="!name.trim()"
            class="w-full bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold py-3 sm:py-4 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed min-h-12"
          >
            Enter Family App
          </button>
        </div>

        <!-- Quick Login Options -->
        <div class="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
          <p class="text-xs sm:text-sm text-slate-600 text-center mb-3 sm:mb-4">Or continue as:</p>
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              (click)="loginAsRole('Parent')"
              class="bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              &#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F466; Parent
            </button>
            <button
              (click)="loginAsRole('Child')"
              class="bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-semibold py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              &#x1F466; Child
            </button>
          </div>
        </div>

        <!-- Demo Note -->
        <div class="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs sm:text-sm text-blue-800">
            &#x1F4A1; <strong>Cloud Enabled:</strong> Data is stored locally and synced to Supabase for multi-device access!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    button:disabled {
      background: linear-gradient(to right, #cbd5e1, #cbd5e1);
    }

    input:focus {
      box-shadow: 0 0 0 3px rgba(41, 56, 143, 0.1);
    }

    @media (hover: none) and (pointer: coarse) {
      button:not(:disabled):hover {
        box-shadow: none;
      }

      button:not(:disabled):active {
        transform: scale(0.98);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  name = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    if (this.name.trim()) {
      this.authService.login(this.name);
      this.router.navigate(['/']);
    }
  }

  loginAsRole(role: string): void {
    this.authService.login(role);
    this.router.navigate(['/']);
  }
}
