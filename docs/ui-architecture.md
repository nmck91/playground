# Playground Nx Monorepo - Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-08 | 1.0 | Initial frontend architecture documentation | Claude |

---

## 1. Template and Framework Selection

### Project Context

This is an **existing production Nx monorepo** containing two Angular applications:
- **Reward Chart** (`apps/reward-chart`) - Family reward tracking with two-way accountability
- **Family Calendar** (`apps/family-calendar`) - Event management with recurring event support

Both applications are:
- ✅ Built with Angular 20.3.0 (latest stable)
- ✅ Using standalone components (no NgModules)
- ✅ Connected to Supabase backend
- ✅ Deployed to Vercel via GitHub integration
- ✅ In production and actively used

### Framework Choice Rationale

**Angular 20.3.0** was chosen for:
- **Modern patterns**: Standalone components, inject() function, Signals
- **Type safety**: Full TypeScript integration with strict type checking
- **Nx integration**: First-class support for Angular monorepos
- **Developer experience**: Excellent tooling, CLI, and debugging support
- **Performance**: Fine-grained reactivity with Signals, ahead-of-time compilation
- **Ecosystem**: Rich component libraries, testing tools, and community support

### Nx Monorepo Structure

**Monorepo Manager**: Nx 22.0.2
- Provides build caching, affected command detection, and task orchestration
- Manages dependencies between apps and future shared libraries
- Enables consistent tooling across all projects

### No Starter Template Used

Both applications were built from scratch using:
- `nx generate @nx/angular:application` for initial scaffolding
- Custom migration from vanilla HTML prototypes to Angular architecture
- Tailored component structure based on specific domain needs

---

## 2. Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Framework** | Angular | ~20.3.0 | Core UI framework | Modern reactive framework with excellent TypeScript support, standalone components, and Signals for fine-grained reactivity |
| **UI Paradigm** | Standalone Components | N/A | Component architecture | Modern Angular pattern eliminating NgModules, simplifying mental model and reducing boilerplate |
| **State Management** | RxJS BehaviorSubject + Signals | 7.8.0 (RxJS) | Application state | BehaviorSubject for reward-chart (complex streams), Signals for family-calendar (simple state). Both first-party Angular solutions with zero dependencies |
| **Routing** | Angular Router | ~20.3.0 | Client-side navigation | Built-in Angular routing (not currently used but available for future SPA routes) |
| **Build Tool** | Angular Build (esbuild) | ~20.3.0 | Build and bundling | Angular's modern build system using esbuild for fast builds and optimal production bundles |
| **Styling** | CSS Custom Properties | N/A | Design system | Custom design token system using CSS variables for theming, no CSS-in-JS overhead, excellent performance |
| **Testing - Unit** | Jest + jest-preset-angular | ~29.7.0 / ~14.6.1 | Component and service testing | Fast, parallel test execution with Angular-specific utilities for TestBed, dependency injection mocking |
| **Testing - E2E** | Playwright | ^1.36.0 | End-to-end testing | Modern, reliable browser automation with parallel execution and cross-browser support |
| **Component Library** | Custom Components | N/A | UI components | Custom-built components tailored to domain (no third-party library for maximum flexibility) |
| **Form Handling** | Angular Forms (Reactive) | ~20.3.0 | Form validation and state | Built-in Angular reactive forms for settings modal and future form needs |
| **Animation** | CSS Animations | N/A | UI feedback | Lightweight CSS keyframe animations for celebrations and transitions (see `@keyframes celebrate`) |
| **HTTP Client** | Supabase JS SDK | ^2.80.0 | Backend communication | Official Supabase client handling authentication, real-time subscriptions, and database operations |
| **Dev Tools** | Nx CLI + Angular DevTools | 22.0.2 | Development experience | Nx for monorepo management, Angular DevTools browser extension for debugging |
| **Package Manager** | npm | N/A | Dependency management | Standard npm with package-lock.json for deterministic installs |
| **Linting** | ESLint + angular-eslint | ^9.8.0 / ^20.3.0 | Code quality | Modern flat config ESLint with Angular-specific rules |
| **Type Checking** | TypeScript | ~5.9.2 | Static type safety | Strict TypeScript configuration with full type checking enabled |

---

## 3. Project Structure

```plaintext
apps/
├── reward-chart/                      # Reward tracking application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   ├── header.component.html
│   │   │   │   │   └── header.component.css
│   │   │   │   ├── child-card/
│   │   │   │   │   ├── child-card.component.ts
│   │   │   │   │   ├── child-card.component.html
│   │   │   │   │   └── child-card.component.css
│   │   │   │   ├── rewards-modal/
│   │   │   │   ├── settings-modal/
│   │   │   │   └── confetti/
│   │   │   ├── services/
│   │   │   │   ├── chart-data.service.ts       # BehaviorSubject-based state
│   │   │   │   └── supabase.service.ts          # Database client
│   │   │   ├── models/
│   │   │   │   ├── chart-data.model.ts
│   │   │   │   ├── family-member.model.ts
│   │   │   │   └── reward.model.ts
│   │   │   ├── app.ts                           # Root component
│   │   │   ├── app.html
│   │   │   └── app.css
│   │   ├── environments/
│   │   │   ├── environment.ts                   # Dev environment config
│   │   │   └── environment.prod.ts              # Prod environment config
│   │   ├── styles.css                           # Global styles + design tokens
│   │   └── main.ts                              # Application bootstrap
│   ├── public/                                  # Static assets
│   ├── project.json                             # Nx project configuration
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   ├── jest.config.ts
│   └── vercel.json                              # Vercel deployment config
│
├── reward-chart-e2e/                  # E2E tests
│   ├── src/
│   │   └── example.spec.ts
│   ├── playwright.config.ts
│   └── project.json
│
├── family-calendar/                   # Calendar application
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── event.service.ts             # Signal-based state
│   │   │   │   └── supabase.service.ts
│   │   │   ├── models/
│   │   │   │   └── event.model.ts
│   │   │   └── app.ts
│   │   ├── environments/
│   │   ├── styles.css
│   │   └── main.ts
│   ├── public/
│   ├── project.json
│   ├── tsconfig.app.json
│   ├── jest.config.ts
│   └── vercel.json
│
└── family-calendar-e2e/               # E2E tests

docs/                                   # Documentation
├── brief.md                            # Project requirements
├── ui-architecture.md                  # This document
├── VERCEL-SETUP.md                     # Deployment guide
└── DEPLOYMENT-QUICK-REF.md             # CI/CD reference

nx.json                                 # Nx workspace configuration
package.json                            # Monorepo dependencies
tsconfig.base.json                      # Shared TypeScript config
.eslintrc.json                          # Shared ESLint config
```

### Directory Organization Principles

- **Components**: One folder per component containing `.ts`, `.html`, `.css` files
- **Services**: Business logic and state management, injectable via DI
- **Models**: TypeScript interfaces and types for type safety
- **Environments**: Configuration for different deployment targets
- **Public**: Static assets served as-is (favicons, images, etc.)

---

## 4. Component Standards

### Component Template

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define typed event interfaces for clarity
export interface ExampleEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {
  // Inputs: data flowing into the component
  @Input() title!: string;
  @Input() items: string[] = [];

  // Outputs: events emitted to parent
  @Output() itemClicked = new EventEmitter<ExampleEvent>();

  // Internal state
  selectedIndex = 0;

  // Computed property (getter)
  get displayTitle(): string {
    return this.title.toUpperCase();
  }

  // Event handlers
  handleClick(index: number): void {
    this.selectedIndex = index;
    this.itemClicked.emit({
      id: `item-${index}`,
      value: this.items[index]
    });
  }
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Component Class** | PascalCase + "Component" suffix | `ChildCardComponent` |
| **Component Selector** | kebab-case with "app-" prefix | `app-child-card` |
| **Component Files** | kebab-case.component.{ts,html,css} | `child-card.component.ts` |
| **Service Class** | PascalCase + "Service" suffix | `ChartDataService` |
| **Service Files** | kebab-case.service.ts | `chart-data.service.ts` |
| **Model Files** | kebab-case.model.ts | `family-member.model.ts` |
| **Interface Names** | PascalCase (no "I" prefix) | `ChartData`, `FamilyMember` |
| **Event Interfaces** | PascalCase + "Event" suffix | `StarToggleEvent` |
| **Properties** | camelCase | `totalStars`, `weekDisplay` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_CHILDREN`, `DEFAULT_HABITS` |
| **Methods** | camelCase | `toggleStar()`, `calculateTotal()` |
| **Private members** | camelCase (no underscore prefix) | `chartDataSubject` |

### Component Structure Best Practices

1. **Standalone Components Only**: All new components must be standalone
2. **Explicit Imports**: Import `CommonModule` for `*ngIf`, `*ngFor`, pipes
3. **Type Safety**: Always type `@Input()` and `@Output()` properties
4. **Event Interfaces**: Define typed interfaces for complex events
5. **Required Inputs**: Use `!` for required inputs or provide defaults
6. **Presentation vs. Container**:
   - Presentational: Accept inputs, emit events (e.g., `ChildCardComponent`)
   - Container: Inject services, manage state (e.g., `App`)
7. **Single Responsibility**: One component, one purpose

---

## 5. State Management

### Dual Approach Strategy

The monorepo uses **two complementary state management patterns**:

#### 5.1 BehaviorSubject Pattern (Reward Chart)

**When to use**: Complex state with derived streams, multiple subscribers, or RxJS operators needed

**Service Structure**:
```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  // Private state subject
  private chartDataSubject = new BehaviorSubject<ChartData>(initialData);

  // Public observable (read-only)
  public chartData$: Observable<ChartData> = this.chartDataSubject.asObservable();

  // State update method
  toggleStar(section: string, personIndex: number, habitIndex: number, dayIndex: number): void {
    const currentData = this.chartDataSubject.value;
    // Mutate state (acceptable for internal use)
    currentData.kidsStars[personIndex][habitIndex][dayIndex] = !currentData.kidsStars[personIndex][habitIndex][dayIndex];
    // Emit updated state
    this.chartDataSubject.next(currentData);
  }

  // Derived computation method
  calculateTotalStars(section: string, personIndex: number): number {
    const data = this.chartDataSubject.value;
    const starsData = section === 'kids' ? data.kidsStars : data.parentsStars;
    // Computation logic...
    return total;
  }
}
```

**Component Consumption**:
```typescript
export class App implements OnInit {
  private chartDataService = inject(ChartDataService);
  chartData$!: Observable<ChartData>;

  async ngOnInit(): Promise<void> {
    this.chartData$ = this.chartDataService.chartData$;
    await this.chartDataService.initialize();
  }
}
```

**Template Usage**:
```html
<div *ngIf="chartData$ | async as data">
  {{ data.children[0].name }}
</div>
```

#### 5.2 Signals Pattern (Family Calendar)

**When to use**: Simple state updates, fine-grained reactivity, better performance for local state

**Service Structure**:
```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Private writable signal
  private events = signal<CalendarEvent[]>([]);

  // Public readonly signal
  readonly eventsSignal = this.events.asReadonly();

  // State update method
  addEvent(event: CalendarEvent): void {
    this.events.set([...this.events(), event]);
  }

  // Getter method (backward compat)
  getEvents(): CalendarEvent[] {
    return this.events();
  }
}
```

**Component Consumption**:
```typescript
export class CalendarComponent {
  private eventService = inject(EventService);

  // Direct signal access (reactive)
  events = this.eventService.eventsSignal;

  // Or use getter method
  allEvents = this.eventService.getEvents();
}
```

**Template Usage**:
```html
<div *ngFor="let event of events()">
  {{ event.title }}
</div>
```

### State Management Guidelines

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **BehaviorSubject** | Complex streams, operators needed | Powerful RxJS operators, async pipe | More boilerplate, learning curve |
| **Signals** | Simple state, fine-grained reactivity | Simpler API, better performance | Limited operator support (for now) |

**Recommendation for new features**:
- Start with **Signals** for simple state
- Use **BehaviorSubject** when you need `debounceTime`, `switchMap`, `combineLatest`, etc.

### Store Structure

```plaintext
src/app/services/
├── chart-data.service.ts          # BehaviorSubject example
├── event.service.ts               # Signals example
└── supabase.service.ts            # Infrastructure service (stateless)
```

---

## 6. API Integration

### Supabase Client Architecture

Both apps use the **Supabase JavaScript SDK** for all backend operations:
- Authentication (future use)
- Database CRUD operations
- Real-time subscriptions (future use)

### Service Template

```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isConfigured()) {
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.anonKey
      );
      this.initialized = true;
      console.log('✅ Supabase connected!');
    } else {
      console.warn('⚠️ Supabase not configured - running in local-only mode');
    }
  }

  isConfigured(): boolean {
    return !!(environment.supabase?.url && environment.supabase?.anonKey);
  }

  isInitialized(): boolean {
    return this.initialized && this.supabase !== null;
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  // Example CRUD operation with typed response
  async loadFamilyMembers(): Promise<FamilyMemberDB[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('family_members')
        .select('*')
        .order('display_order');

      if (error) throw error;

      console.log('✅ Loaded family members:', data);
      return data || [];
    } catch (error) {
      console.error('Error loading family members:', error);
      return [];
    }
  }

  // Example upsert operation
  async saveStarCompletion(
    memberId: string,
    habitIndex: number,
    dayIndex: number,
    isCompleted: boolean
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('star_completions')
        .upsert({
          member_id: memberId,
          habit_index: habitIndex,
          day_index: dayIndex,
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'member_id,habit_index,day_index'
        });

      if (error) throw error;

      console.log('💾 Saved to Supabase:', memberId, habitIndex, dayIndex, isCompleted);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }
}
```

### API Client Configuration

**Supabase client** is configured once per service and reused:
- **No HTTP interceptors needed** - Supabase SDK handles auth headers automatically
- **Error handling** - Try/catch blocks in each method, console logging for debugging
- **Graceful degradation** - Apps check `isConfigured()` before attempting operations

### Integration with State Services

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private supabaseService = inject(SupabaseService);

  async initialize(): Promise<void> {
    if (this.supabaseService.isInitialized()) {
      await this.loadFromSupabase();
    }
  }

  private async loadFromSupabase(): Promise<void> {
    const members = await this.supabaseService.loadFamilyMembers();
    const completions = await this.supabaseService.loadStarCompletions();
    // Update local state...
    this.chartDataSubject.next(updatedData);
  }

  async toggleStar(...args): Promise<void> {
    // Update local state first (optimistic)
    this.chartDataSubject.next(updatedData);

    // Persist to backend (fire-and-forget or await)
    if (this.supabaseService.isInitialized()) {
      await this.supabaseService.saveStarCompletion(...);
    }
  }
}
```

---

## 7. Routing

### Current State: Single-Page Applications

Both apps are currently **single-page without routing**:
- No multiple views or navigation
- Entire UI rendered in single component tree
- Future routing can be added when needed

### Future Route Configuration Template

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

**When routing is needed**:
1. Use lazy-loaded routes for better performance
2. Implement `AuthGuard` for protected routes
3. Use Angular Router's built-in features (query params, route data, etc.)

---

## 8. Styling Guidelines

### Styling Approach

**CSS Custom Properties (CSS Variables)** for design tokens:
- ✅ Zero runtime overhead
- ✅ Works across all frameworks
- ✅ Native browser support
- ✅ Easy theme switching (light/dark mode)
- ✅ No build-time processing needed

**Component-scoped CSS**:
- Each component has its own `.css` file
- Angular's view encapsulation prevents style leakage
- Global tokens defined in `src/styles.css`

### Global Theme Variables

See `apps/reward-chart/src/styles.css` for the complete design system:

```css
:root {
  /* ============================================
     DESIGN TOKENS - Comprehensive System
     ============================================ */

  /* Primitive Color Tokens */
  --color-white: rgba(255, 255, 255, 1);
  --color-black: rgba(0, 0, 0, 1);
  --color-cream-50: rgba(252, 252, 249, 1);
  --color-cream-100: rgba(255, 255, 253, 1);
  --color-gray-200: rgba(245, 245, 245, 1);
  --color-gray-300: rgba(167, 169, 169, 1);
  --color-gray-400: rgba(119, 124, 124, 1);
  --color-slate-500: rgba(98, 108, 113, 1);
  --color-brown-600: rgba(94, 82, 64, 1);
  --color-charcoal-700: rgba(31, 33, 33, 1);
  --color-charcoal-800: rgba(38, 40, 40, 1);
  --color-slate-900: rgba(19, 52, 59, 1);
  --color-teal-300: rgba(50, 184, 198, 1);
  --color-teal-400: rgba(45, 166, 178, 1);
  --color-teal-500: rgba(33, 128, 141, 1);
  --color-teal-600: rgba(29, 116, 128, 1);
  --color-teal-700: rgba(26, 104, 115, 1);
  --color-teal-800: rgba(41, 150, 161, 1);
  --color-red-400: rgba(255, 84, 89, 1);
  --color-red-500: rgba(192, 21, 47, 1);
  --color-orange-400: rgba(230, 129, 97, 1);
  --color-orange-500: rgba(168, 75, 47, 1);

  /* RGB Variants for Opacity Control */
  --color-brown-600-rgb: 94, 82, 64;
  --color-teal-500-rgb: 33, 128, 141;
  --color-slate-900-rgb: 19, 52, 59;
  --color-slate-500-rgb: 98, 108, 113;
  --color-red-500-rgb: 192, 21, 47;

  /* Semantic Color Tokens (Light Mode) */
  --color-background: var(--color-cream-50);
  --color-surface: var(--color-cream-100);
  --color-text: var(--color-slate-900);
  --color-text-secondary: var(--color-slate-500);
  --color-primary: var(--color-teal-500);
  --color-primary-hover: var(--color-teal-600);
  --color-primary-active: var(--color-teal-700);
  --color-secondary: rgba(var(--color-brown-600-rgb), 0.12);
  --color-secondary-hover: rgba(var(--color-brown-600-rgb), 0.2);
  --color-secondary-active: rgba(var(--color-brown-600-rgb), 0.25);
  --color-border: rgba(var(--color-brown-600-rgb), 0.2);
  --color-btn-primary-text: var(--color-cream-50);
  --color-card-border: rgba(var(--color-brown-600-rgb), 0.12);
  --color-error: var(--color-red-500);
  --color-success: var(--color-teal-500);
  --color-warning: var(--color-orange-500);
  --color-info: var(--color-slate-500);
  --color-focus-ring: rgba(var(--color-teal-500-rgb), 0.4);

  /* Typography System */
  --font-family-base: "FKGroteskNeue", "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "Berkeley Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 30px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 550;
  --font-weight-bold: 600;
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --letter-spacing-tight: -0.01em;

  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-1: 1px;
  --space-2: 2px;
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-base: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
  --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.03);

  /* Animation Timing */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);

  /* Domain-Specific Colors */
  --child-1-color: #87CEEB;  /* Fíadh - Sky Blue */
  --child-2-color: #90EE90;  /* Sé - Light Green */
  --child-3-color: #DDA0DD;  /* Niall Óg - Plum */
  --parent-color: #FFE55C;   /* Mum & Dad - Yellow */
}

/* Dark Mode Support (Future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-charcoal-800);
    --color-surface: var(--color-charcoal-700);
    --color-text: var(--color-cream-50);
    --color-text-secondary: var(--color-gray-300);
    /* Remap other semantic tokens as needed */
  }
}

/* Global Resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-base);
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: var(--line-height-normal);
}

/* Utility Classes */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-standard);
  border: none;
  text-decoration: none;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-btn-primary-text);
}

.btn--primary:hover {
  background: var(--color-primary-hover);
}

.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}

.btn--secondary:hover {
  background: var(--color-secondary-hover);
}

.hidden {
  display: none !important;
}

/* Celebration Animation */
@keyframes celebrate {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Responsive Utilities */
@media (max-width: 768px) {
  .btn {
    width: 100%;
    padding: var(--space-12) var(--space-16);
  }
}
```

### Component Styling Example

```css
/* child-card.component.css */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: var(--space-16);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-normal) var(--ease-standard);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-12);
}

.card--child-1 {
  border-left: 4px solid var(--child-1-color);
}
```

### Styling Best Practices

1. **Use design tokens**: Always reference CSS variables, never hardcode values
2. **Component-scoped styles**: Keep styles in component `.css` files
3. **BEM methodology** (optional): `.block__element--modifier` for clarity
4. **Responsive design**: Mobile-first with `@media` queries
5. **Accessibility**: Sufficient color contrast, focus states, ARIA support
6. **Performance**: Avoid expensive properties (`box-shadow`, `filter`) on animations

---

## 9. Testing Requirements

### Component Test Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildCardComponent, StarToggleEvent } from './child-card.component';
import { FamilyMember, StarsData } from '../../models/chart-data.model';

describe('ChildCardComponent', () => {
  let component: ChildCardComponent;
  let fixture: ComponentFixture<ChildCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildCardComponent]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(ChildCardComponent);
    component = fixture.componentInstance;

    // Setup required inputs
    component.person = { name: 'Test Child', color: '#87CEEB', className: 'child-1' };
    component.personIndex = 0;
    component.section = 'kids';
    component.habits = ['Brush teeth', 'Tidy room'];
    component.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    component.starsData = { 0: { 0: [false, false, false, false, false, false, false] } };
    component.totalStars = 0;
    component.nextMilestone = 20;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display person name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card__name')?.textContent).toContain('Test Child');
  });

  it('should calculate progress percent correctly', () => {
    component.totalStars = 10;
    component.nextMilestone = 20;
    expect(component.progressPercent).toBe(50);
  });

  it('should emit starToggled event when star is clicked', () => {
    const emittedEvents: StarToggleEvent[] = [];
    component.starToggled.subscribe((event: StarToggleEvent) => {
      emittedEvents.push(event);
    });

    component.toggleStar(0, 0);

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      section: 'kids',
      personIndex: 0,
      habitIndex: 0,
      dayIndex: 0
    });
  });
});
```

### Service Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { ChartDataService } from './chart-data.service';
import { SupabaseService } from './supabase.service';

describe('ChartDataService', () => {
  let service: ChartDataService;
  let supabaseServiceSpy: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SupabaseService', ['isInitialized', 'loadFamilyMembers', 'saveStarCompletion']);

    TestBed.configureTestingModule({
      providers: [
        ChartDataService,
        { provide: SupabaseService, useValue: spy }
      ]
    });

    service = TestBed.inject(ChartDataService);
    supabaseServiceSpy = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate total stars correctly', () => {
    const total = service.calculateTotalStars('kids', 0);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it('should toggle star and emit updated state', (done) => {
    service.chartData$.subscribe(data => {
      const starValue = data.kidsStars[0]?.[0]?.[0];
      if (starValue !== undefined) {
        expect(typeof starValue).toBe('boolean');
        done();
      }
    });

    service.toggleStar('kids', 0, 0, 0);
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation
   - Mock dependencies (services, router, etc.)
   - Focus on component logic, not Angular internals
   - Aim for 80%+ coverage on business logic

2. **Integration Tests**: Test component interactions
   - Test parent-child communication via `@Input`/`@Output`
   - Verify event chains work correctly
   - Use `fixture.detectChanges()` to trigger change detection

3. **E2E Tests**: Test critical user flows (using Playwright)
   - Login/authentication flows (when implemented)
   - Core user journeys (star tracking, reward viewing)
   - Cross-browser compatibility
   - Mobile responsiveness

4. **Coverage Goals**: Aim for 80% code coverage
   - Focus on business logic, not boilerplate
   - Test edge cases and error handling
   - Mock external dependencies (Supabase, localStorage)

5. **Test Structure**: Arrange-Act-Assert pattern
   ```typescript
   it('should do something', () => {
     // Arrange: Set up test data
     component.input = 'test';

     // Act: Execute the behavior
     component.doSomething();

     // Assert: Verify the outcome
     expect(component.output).toBe('expected');
   });
   ```

6. **Mock External Dependencies**: API calls, routing, state management
   - Use Jasmine spies for services
   - Use `TestBed.configureTestingModule` to override providers
   - Avoid real HTTP requests in unit tests

### Running Tests

```bash
# Unit tests (Jest)
npx nx test reward-chart          # Run tests for reward-chart
npx nx test family-calendar       # Run tests for family-calendar
npx nx test --watch              # Watch mode
npx nx test --coverage           # Generate coverage report

# E2E tests (Playwright)
npx nx e2e reward-chart-e2e      # Run E2E tests
npx nx e2e --headed              # Run with browser visible
```

---

## 10. Environment Configuration

### Environment Files

Each app has two environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  supabase: {
    url: '',  // Leave empty or use local Supabase
    anonKey: ''
  }
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  supabase: {
    url: process.env['SUPABASE_URL'] || '',
    anonKey: process.env['SUPABASE_ANON_KEY'] || ''
  }
};
```

### Required Environment Variables

**Vercel Environment Variables** (set in Vercel dashboard):

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1...` | Yes |

### Configuration Best Practices

1. **Never commit secrets** to repository
2. **Use Vercel dashboard** to set production environment variables
3. **Local development** can work without Supabase (falls back to localStorage)
4. **Type safety**: Define environment interface for autocomplete:

```typescript
// src/environments/environment.interface.ts
export interface Environment {
  production: boolean;
  supabase: {
    url: string;
    anonKey: string;
  };
}
```

5. **Build-time substitution**: Angular CLI replaces `environment.ts` with `environment.prod.ts` during production builds

---

## 11. Frontend Developer Standards

### Critical Coding Rules

#### Universal Rules (All Frameworks)

1. **Type Everything**
   - ❌ `const data: any = ...`
   - ✅ `const data: ChartData = ...`
   - Use TypeScript interfaces for all data structures
   - Enable strict mode in `tsconfig.json`

2. **No Magic Strings or Numbers**
   - ❌ `if (status === 'active') ...`
   - ✅ `if (status === UserStatus.Active) ...`
   - Use enums or const objects for repeated values

3. **Explicit Error Handling**
   - Always wrap async operations in try/catch
   - Log errors with context: `console.error('Failed to load members:', error)`
   - Never silently swallow errors

4. **Avoid Mutation Where Possible**
   - BehaviorSubject: Can mutate internal state, but emit new reference
   - Signals: Use `.set([...current, newItem])` pattern
   - Inputs: Never mutate `@Input()` properties directly

5. **Accessibility First**
   - All interactive elements must have ARIA labels
   - Keyboard navigation must work
   - Color contrast must meet WCAG AA standards

#### Angular-Specific Rules

6. **Always Use Standalone Components**
   - ❌ `@NgModule({ declarations: [...] })`
   - ✅ `@Component({ standalone: true, imports: [...] })`

7. **Modern Dependency Injection**
   - ❌ `constructor(private service: MyService) {}`
   - ✅ `private service = inject(MyService);`
   - Use `inject()` function for cleaner, more testable code

8. **Prefer Signals Over BehaviorSubject for Simple State**
   - New features should default to Signals unless RxJS operators needed
   - Signals have better performance and simpler mental model

9. **OnPush Change Detection for Performance**
   - Use `ChangeDetectionStrategy.OnPush` for presentational components
   - Reduces unnecessary change detection cycles

10. **Unsubscribe from Observables**
    - Use `async` pipe in templates (auto-unsubscribes)
    - Or use `takeUntilDestroyed()` operator
    - Or manually unsubscribe in `ngOnDestroy`

11. **Lazy Load Routes**
    - Use `loadComponent` for route components
    - Reduces initial bundle size

12. **Component Communication Patterns**
    - Parent → Child: `@Input()`
    - Child → Parent: `@Output()` with typed `EventEmitter`
    - Sibling/Distant: Use service with Observable/Signal

### Quick Reference

#### Common Commands

```bash
# Development server
npx nx serve reward-chart           # Start dev server on port 4300
npx nx serve family-calendar        # Start dev server on port 4200

# Build
npx nx build reward-chart --configuration=production
npx nx build family-calendar --configuration=production

# Lint
npx nx lint reward-chart
npx nx lint family-calendar

# Test
npx nx test reward-chart            # Unit tests
npx nx e2e reward-chart-e2e         # E2E tests

# Affected commands (only changed apps)
npx nx affected:lint
npx nx affected:test
npx nx affected:build

# Generate component
npx nx g @nx/angular:component my-component --project=reward-chart --standalone

# Generate service
npx nx g @nx/angular:service my-service --project=reward-chart
```

#### Key Import Patterns

```typescript
// Angular Core
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

// Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment
import { environment } from '../environments/environment';

// Models (use absolute paths from src)
import { ChartData } from './models/chart-data.model';
```

#### File Naming Conventions

```plaintext
✅ Correct:
child-card.component.ts
child-card.component.html
child-card.component.css
chart-data.service.ts
family-member.model.ts

❌ Incorrect:
ChildCard.component.ts
child-card-component.ts
chartData.service.ts
FamilyMember.ts
```

#### Project-Specific Patterns

**Design Tokens Usage**:
```css
/* Always use CSS variables */
.my-component {
  color: var(--color-text);              /* ✅ */
  padding: var(--space-16);              /* ✅ */
  border-radius: var(--radius-lg);       /* ✅ */

  /* NEVER hardcode */
  color: #1f2121;                        /* ❌ */
  padding: 16px;                         /* ❌ */
}
```

**Service Injection Pattern**:
```typescript
export class MyComponent {
  // ✅ Modern inject() function
  private myService = inject(MyService);

  // ❌ Avoid constructor injection
  constructor(private myService: MyService) {}
}
```

**State Management Pattern Decision**:
```typescript
// Simple state? Use Signals ✅
private items = signal<Item[]>([]);

// Need operators? Use BehaviorSubject ✅
private items$ = new BehaviorSubject<Item[]>([]);
items$.pipe(debounceTime(300)).subscribe(...)
```

---

## Document Maintenance

This document should be updated when:
- Framework versions are upgraded
- New state management patterns are adopted
- Shared libraries are created
- Routing is implemented
- Authentication is added
- New testing strategies are introduced

**Last Updated**: 2025-11-08
**Maintained By**: Development Team
**Questions?** Review existing code in `apps/reward-chart` and `apps/family-calendar` for reference implementations.

---

## 12. TailwindCSS & PrimeNG Integration

### Overview

**Added: 2025-11-08**

Both Angular applications now support **TailwindCSS** for utility-first styling and **PrimeNG** for pre-built Angular UI components, working alongside the existing CSS custom properties design system.

### Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `primeng` | 20.3.0 | Angular UI component library |
| `@primeng/themes` | Latest | PrimeNG theming system |
| `primeicons` | Latest | Icon library for PrimeNG |
| `tailwindcss` | 3.0.2 | Utility-first CSS framework |

### TailwindCSS Configuration

Each application has its own Tailwind configuration file:

#### family-calendar/tailwind.config.js

```javascript
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### reward-chart/tailwind.config.js

Includes custom color mappings from existing CSS variables for backward compatibility:

```javascript
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: 'rgba(252, 252, 249, 1)',
          100: 'rgba(255, 255, 253, 1)',
        },
        teal: {
          300: 'rgba(50, 184, 198, 1)',
          400: 'rgba(45, 166, 178, 1)',
          500: 'rgba(33, 128, 141, 1)',
          600: 'rgba(29, 116, 128, 1)',
          700: 'rgba(26, 104, 115, 1)',
          800: 'rgba(41, 150, 161, 1)',
        },
        slate: {
          500: 'rgba(98, 108, 113, 1)',
          900: 'rgba(19, 52, 59, 1)',
        },
        brown: {
          600: 'rgba(94, 82, 64, 1)',
        },
        charcoal: {
          700: 'rgba(31, 33, 33, 1)',
          800: 'rgba(38, 40, 40, 1)',
        },
      },
      fontFamily: {
        base: ['FKGroteskNeue', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Berkeley Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        base: '8px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.02)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
};
```

### PrimeNG Configuration

PrimeNG is configured in each app's `app.config.ts` using the `providePrimeNG` function:

```typescript
// apps/family-calendar/src/app/app.config.ts
// apps/reward-chart/src/app/app.config.ts

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    providePrimeNG({
      theme: {
        preset: Aura,  // Using Aura preset theme
        options: {
          darkModeSelector: false,
          cssLayer: false
        }
      }
    })
  ],
};
```

### Styles Configuration

Each app's `styles.css` imports PrimeIcons and Tailwind directives:

```css
/* PrimeIcons */
@import "primeicons/primeicons.css";

/* TailwindCSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your existing custom CSS variables and styles follow... */
```

### Usage Examples

#### Using TailwindCSS Utilities

```html
<!-- Buttons with Tailwind -->
<button class="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Click me
</button>

<!-- Cards with Tailwind -->
<div class="bg-white rounded-lg shadow-md p-6 max-w-md hover:shadow-lg transition-shadow">
  <h2 class="text-2xl font-bold text-slate-900 mb-4">Card Title</h2>
  <p class="text-slate-600 leading-relaxed">Card content goes here</p>
</div>

<!-- Flexbox layouts -->
<div class="flex items-center justify-between gap-4">
  <span class="text-sm text-slate-500">Left content</span>
  <span class="font-semibold text-teal-600">Right content</span>
</div>

<!-- Grid layouts -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-cream-100 p-4 rounded-base">Item 1</div>
  <div class="bg-cream-100 p-4 rounded-base">Item 2</div>
  <div class="bg-cream-100 p-4 rounded-base">Item 3</div>
</div>
```

#### Using PrimeNG Components

Import PrimeNG components as needed in your component files:

```typescript
// In your component.ts
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, TableModule, DialogModule],
  template: `
    <!-- PrimeNG Button -->
    <p-button label="Save" icon="pi pi-check" severity="success" />
    <p-button label="Cancel" icon="pi pi-times" severity="secondary" />

    <!-- PrimeNG Card -->
    <p-card header="User Profile" subheader="Personal Information">
      <p>Card content with structured data</p>
    </p-card>

    <!-- PrimeNG Input -->
    <div class="field">
      <label for="username">Username</label>
      <input id="username" type="text" pInputText placeholder="Enter username" />
    </div>

    <!-- PrimeNG Table -->
    <p-table [value]="items" [tableStyle]="{'min-width': '50rem'}">
      <ng-template pTemplate="header">
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-item>
        <tr>
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
          <td>
            <p-button icon="pi pi-pencil" severity="info" [text]="true" />
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- PrimeNG Dialog -->
    <p-dialog header="Settings" [(visible)]="displayDialog" [modal]="true">
      <p>Dialog content goes here</p>
    </p-dialog>
  `
})
export class ExampleComponent {
  items = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ];
  displayDialog = false;
}
```

#### Combining TailwindCSS with PrimeNG

You can combine both approaches for maximum flexibility:

```html
<!-- PrimeNG components styled with Tailwind utilities -->
<div class="flex gap-4 mb-6">
  <p-button
    label="Primary Action"
    class="flex-1"
    severity="primary"
  />
  <p-button
    label="Secondary"
    class="flex-1"
    severity="secondary"
  />
</div>

<!-- PrimeNG dialog with Tailwind layout -->
<p-dialog header="User Settings" [(visible)]="display" [modal]="true">
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block mb-2 text-sm font-medium text-slate-700">Name</label>
      <input pInputText class="w-full" placeholder="Enter name" />
    </div>
    <div>
      <label class="block mb-2 text-sm font-medium text-slate-700">Email</label>
      <input pInputText type="email" class="w-full" placeholder="Enter email" />
    </div>
  </div>
  <div class="flex justify-end gap-2 mt-6">
    <p-button label="Cancel" severity="secondary" (onClick)="display = false" />
    <p-button label="Save" severity="primary" (onClick)="saveSettings()" />
  </div>
</p-dialog>
```

### Common PrimeNG Components

#### Form Components
- `ButtonModule` - Buttons with various severity levels (primary, secondary, success, danger, etc.)
- `InputTextModule` - Text inputs with consistent styling
- `DropdownModule` - Select dropdowns with search and filtering
- `CalendarModule` - Date pickers with range selection
- `CheckboxModule` - Checkboxes with tri-state support
- `RadioButtonModule` - Radio buttons
- `InputNumberModule` - Number inputs with increment/decrement
- `InputSwitchModule` - Toggle switches

#### Data Display
- `TableModule` - Feature-rich data tables with sorting, filtering, pagination, row selection
- `CardModule` - Content containers with header, footer, and content sections
- `DataViewModule` - Flexible data display with list/grid view toggle
- `PanelModule` - Collapsible panels
- `TimelineModule` - Timeline component for chronological data

#### Overlays
- `DialogModule` - Modal dialogs with customizable content
- `ToastModule` - Toast notifications for user feedback
- `ConfirmDialogModule` - Confirmation dialogs for destructive actions
- `TooltipModule` - Tooltips on hover
- `OverlayPanelModule` - Floating overlay panels

#### Navigation
- `MenuModule` - Dropdown menus
- `TabViewModule` - Tabbed navigation
- `BreadcrumbModule` - Breadcrumb navigation
- `StepsModule` - Step-by-step progress indicator
- `PanelMenuModule` - Accordion-style navigation

#### Charts (requires `primeng/chart` and Chart.js)
- Bar, Line, Pie, Doughnut, Radar, PolarArea charts

### Available PrimeNG Themes

PrimeNG v20 uses the `@primeng/themes` package with configurable presets:

- **Aura** (currently configured) - Modern, clean design system
- **Lara** - Material Design-inspired theme
- **Nora** - Minimal, elegant design

To change themes, update `app.config.ts`:

```typescript
import Lara from '@primeng/themes/lara';
// or
import Nora from '@primeng/themes/nora';

providePrimeNG({
  theme: {
    preset: Lara,  // Changed from Aura
    options: {
      darkModeSelector: '.dark-mode',  // Enable dark mode with CSS class
      cssLayer: false
    }
  }
})
```

### PrimeIcons Usage

PrimeIcons are available throughout the application:

```html
<!-- Icon in button -->
<p-button icon="pi pi-check" label="Save" />

<!-- Standalone icon with sizing -->
<i class="pi pi-search text-2xl text-teal-500"></i>

<!-- Icons in headings -->
<h2>
  <i class="pi pi-user mr-2"></i>
  User Profile
</h2>

<!-- Icon buttons -->
<p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="info" />
```

**Icon Reference**: Browse all 200+ icons at https://primeng.org/icons

### Styling Strategy

The monorepo now supports **three complementary styling approaches**:

1. **CSS Custom Properties (Existing)**: Design tokens for consistent theming
   ```css
   .my-component {
     color: var(--color-text);
     padding: var(--space-16);
   }
   ```

2. **TailwindCSS Utilities (New)**: Rapid UI development with utility classes
   ```html
   <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
     <!-- content -->
   </div>
   ```

3. **PrimeNG Components (New)**: Pre-built, accessible Angular components
   ```html
   <p-button label="Click me" severity="primary" />
   ```

**When to use each**:
- **CSS Variables**: Brand colors, spacing scale, typography system
- **Tailwind**: Layout, spacing, responsive design, utility styling
- **PrimeNG**: Form inputs, data tables, dialogs, complex interactive components

### Build Verification

Both applications build successfully with TailwindCSS and PrimeNG integrated:

```bash
# Build individual apps
npx nx build family-calendar
npx nx build reward-chart

# Build all apps
npx nx run-many -t build

# Serve with live reload
npx nx serve family-calendar  # Port 4200
npx nx serve reward-chart     # Port 4300
```

### Bundle Size Considerations

- **PrimeNG Impact**: ~130KB added to bundle (one-time cost)
- **Tree Shaking**: Only import PrimeNG modules you use
- **TailwindCSS**: Purges unused utilities in production builds
- **Optimization**: Enable production build configuration for optimal bundle sizes

```bash
# Production build with optimizations
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production
```

### Migration Notes

#### Existing Code Compatibility

- **Backward Compatible**: Existing CSS custom properties continue to work
- **Incremental Adoption**: Use TailwindCSS/PrimeNG for new features
- **No Breaking Changes**: All existing components remain functional

#### Reward Chart Specific

- Custom design tokens are mapped to Tailwind theme
- Existing `.btn`, `.card` classes work alongside Tailwind utilities
- Child color variables preserved: `--child-1-color`, `--child-2-color`, etc.

#### Family Calendar Specific

- TailwindCSS already configured (fresh implementation)
- PrimeNG theming uses Aura preset
- Ready for component library adoption

### Developer Resources

- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **PrimeNG Documentation**: https://primeng.org/
- **PrimeNG Angular 20 Guide**: https://primeng.org/installation
- **PrimeNG Showcase**: https://primeng.org/showcase (component examples)
- **PrimeNG Themes**: https://primeng.org/theming
- **Nx + TailwindCSS**: https://nx.dev/recipes/other/using-tailwind-css-with-angular-projects

### Quick Component Import Reference

```typescript
// Common imports for PrimeNG components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
```

---

**End of Frontend Architecture Document**
