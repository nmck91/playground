import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full">
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">
          Sign in to Session Stash
        </h1>
        <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <p class="text-gray-500 text-center">Login form coming soon...</p>
          <div class="mt-6 text-center">
            <a routerLink="/signup" class="text-primary-600 hover:text-primary-700">
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {}
