import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <a routerLink="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-3 sm:mb-4 text-sm sm:text-base">
            <span>←</span>
            <span>Back Home</span>
          </a>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">{{ title }}</h1>
        </div>
      </div>

      <!-- Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto">
        <div class="bg-white rounded-lg sm:rounded-2xl shadow-md p-5 sm:p-8 text-center border-2 border-brand-secondary/20">
          <div class="text-5xl sm:text-6xl mb-4 sm:mb-6">🚀</div>
          <h2 class="text-xl sm:text-2xl font-bold text-brand-primary mb-3 sm:mb-4">Coming Soon!</h2>
          <p class="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
            This page is ready to be built. Continue prompting to fill in this page contents!
          </p>
          <a
            routerLink="/"
            class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-secondary text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:shadow-lg transition-all min-h-12 text-sm sm:text-base"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    a {
      -webkit-tap-highlight-color: transparent;
    }

    @media (hover: none) and (pointer: coarse) {
      a:hover {
        box-shadow: none;
      }

      a:active {
        transform: scale(0.98);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }
  `]
})
export class PlaceholderComponent {
  @Input() title = 'Coming Soon';
}
