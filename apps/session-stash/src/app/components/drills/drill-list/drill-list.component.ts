import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-drill-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-200 px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">My Drills</h1>
          <a
            routerLink="/drills/add"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Add Drill
          </a>
        </div>
      </header>
      <main class="p-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p class="text-gray-500">No drills yet. Add your first drill!</p>
        </div>
      </main>
    </div>
  `,
})
export class DrillListComponent {}
