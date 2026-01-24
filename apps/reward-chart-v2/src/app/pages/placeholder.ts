import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 min-h-[calc(100vh-80px)]">
      <!-- Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto">
        <div class="bg-white rounded-lg sm:rounded-2xl shadow-md p-5 sm:p-8 text-center border-2 border-brand-secondary/20">
          <div class="text-5xl sm:text-6xl mb-4 sm:mb-6">&#x1F680;</div>
          <h2 class="text-xl sm:text-2xl font-bold text-brand-primary mb-3 sm:mb-4">Coming Soon!</h2>
          <p class="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
            This page is ready to be built. The {{ title }} feature will be available soon!
          </p>
          <a
            routerLink="/"
            class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-secondary text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:shadow-lg transition-all min-h-12 text-sm sm:text-base"
          >
            &larr; Back to Home
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
  title = 'Coming Soon';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      if (data['title']) {
        this.title = data['title'];
      }
    });
  }
}
