import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-200 px-4 py-4">
        <div class="flex items-center gap-4">
          <a routerLink="/drills" class="text-gray-500 hover:text-gray-700">
            ← Back
          </a>
          <h1 class="text-xl font-bold text-gray-900">Manage Tags</h1>
        </div>
      </header>
      <main class="p-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-gray-500 text-center">Tag management coming soon...</p>
        </div>
      </main>
    </div>
  `,
})
export class TagManagerComponent {}
