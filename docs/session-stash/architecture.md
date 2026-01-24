# Session Stash Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-24 | 1.0 | Initial architecture document | Winston (Architect) |

---

## 1. Template and Framework Selection

### Framework Decision

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Framework** | Angular 19+ (standalone components) | PRD requirement + monorepo consistency |
| **Starter** | Nx Angular App Generator | Established patterns, shared tooling |
| **Structure** | Flat app structure (no feature libs) | Right-sized for scope, follows reward-chart pattern |
| **UI Components** | Tailwind CSS + PrimeNG (selective) | Speed + consistency, already available in monorepo |
| **PWA** | @angular/pwa + Workbox strategies | Offline read support, background sync for writes |
| **Share Target** | Progressive enhancement | Feature detection with manual entry fallback |

### Constraints from Existing Monorepo

- Uses `@nx/angular:application` generator
- Follows existing patterns from `reward-chart` app
- Leverages shared `tailwind-preset` library
- Reuses established Supabase service pattern
- Jest for unit tests, Playwright for e2e

### Offline Strategy

- **Read operations:** Service worker caches drill list and details for offline browsing
- **Write operations:** Queued when offline, synced when connection restored
- **Scope:** Offline support is for convenience, not a hard requirement

---

## 2. Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Framework** | Angular | 19.x | Core SPA framework | PRD requirement, monorepo standard |
| **Build System** | Nx | 21.x | Monorepo tooling | Already configured, caching, affected commands |
| **UI Library** | PrimeNG | 19.x | Form inputs, dialogs, chips | Already in monorepo, speeds development |
| **Styling** | Tailwind CSS | 4.x | Utility-first styling | PRD requirement, shared preset available |
| **State Management** | Angular Signals | Built-in | Reactive state | Modern, simple, no extra dependencies |
| **Routing** | @angular/router | 19.x | SPA navigation | Standard Angular, lazy loading support |
| **HTTP Client** | @supabase/supabase-js | 2.x | Backend communication | Direct Supabase client, auth included |
| **Type Generation** | supabase gen types | CLI | TypeScript types from DB | Catch schema errors at compile time |
| **Forms** | Angular Reactive Forms | 19.x | Form handling & validation | Built-in, powerful validation |
| **PWA** | @angular/pwa | 19.x | Service worker, manifest | Official Angular PWA support |
| **Testing** | Jest | 29.x | Unit testing | Monorepo standard |
| **E2E Testing** | Playwright | 1.x | End-to-end tests | Monorepo standard |
| **Dev Tools** | Angular DevTools | Latest | Debugging | Component inspection, profiling |

### Key Technical Decisions

**Signals over NgRx:** App scope is small (drills, tags, auth state). Signals are built-in with no extra bundle size and simpler mental model. Can upgrade to signal-based stores if complexity grows.

**PrimeNG (selective) over pure Tailwind:** Using only `p-dialog`, `p-chips`, `p-inputtext`, `p-textarea`, `p-confirmDialog`. Avoids building these from scratch while keeping bundle lean.

**Direct Supabase client over custom API layer:** Supabase JS handles auth, real-time, and queries. RLS handles authorization server-side. Pattern already proven in reward-chart app.

### Risk Mitigations (from Team Review)

| Risk | Mitigation |
|------|------------|
| PWA/offline complexity underestimated | Technical spike before sprint estimation |
| Share Target browser support varies | Progressive enhancement with manual fallback |
| PrimeNG theming conflicts with Tailwind | Configure PrimeNG to use unstyled mode + Tailwind |
| Mobile device-specific issues | Define real device testing strategy (not just emulators) |

---

## 3. Project Structure

```
apps/
  session-stash/
    src/
      app/
        components/
          auth/
            login/
              login.component.ts
              login.component.html
              login.component.spec.ts
            signup/
              signup.component.ts
              signup.component.html
            password-reset/
              password-reset.component.ts
              password-reset.component.html
          drills/
            drill-list/
              drill-list.component.ts
              drill-list.component.html
              drill-list.component.spec.ts
            drill-card/
              drill-card.component.ts
              drill-card.component.html
            drill-detail/
              drill-detail.component.ts
              drill-detail.component.html
            drill-form/
              drill-form.component.ts
              drill-form.component.html
              drill-form.component.spec.ts
          tags/
            tag-chip/
              tag-chip.component.ts
              tag-chip.component.html
            tag-filter/
              tag-filter.component.ts
              tag-filter.component.html
            tag-manager/
              tag-manager.component.ts
              tag-manager.component.html
          shared/
            header/
              header.component.ts
              header.component.html
            empty-state/
              empty-state.component.ts
              empty-state.component.html
            loading-spinner/
              loading-spinner.component.ts
              loading-spinner.component.html
            error-message/
              error-message.component.ts
              error-message.component.html
            offline-indicator/
              offline-indicator.component.ts
              offline-indicator.component.html

        services/
          supabase.service.ts
          auth.service.ts
          drill.service.ts
          tag.service.ts
          offline.service.ts
          share-target.service.ts
          pending-share.service.ts        # Handle share-before-auth

        guards/
          auth.guard.ts

        resolvers/
          auth-ready.resolver.ts          # Wait for auth initialization

        models/
          drill.model.ts
          tag.model.ts
          database.types.ts               # Auto-generated from Supabase

        state/
          auth.state.ts                   # Foundation layer
          tags.state.ts                   # Reference data (imports auth)
          drills.state.ts                 # Business data (imports tags)
          ui.state.ts                     # UI concerns (imports drills)

        app.ts
        app.config.ts
        app.routes.ts

      environments/
        environment.ts
        environment.prod.ts

      styles.css
      main.ts
      index.html
      manifest.webmanifest

    public/
      icons/
      favicon.ico

    project.json
    tailwind.config.js
    tsconfig.app.json
    tsconfig.spec.json
    jest.config.ts

  session-stash-e2e/
    src/
      e2e/
        auth.spec.ts
        drills.spec.ts
        tags.spec.ts
        offline.spec.ts
        share-target.spec.ts
    playwright.config.ts
    project.json
```

### Structure Decisions

| Decision | Rationale |
|----------|-----------|
| Flat `components/` with feature folders | Simple navigation, grouped by domain |
| Separate `services/` folder | Clear separation of data access from UI |
| `state/` with defined dependency order | Prevents circular dependencies |
| `resolvers/` folder | Handle async data needs before route activation |
| Component co-location | `.ts`, `.html`, `.spec.ts` together |

### State Dependency Direction

```
ui.state → drills.state → tags.state → auth.state
```

Each layer can only import from layers to its right.

### Risk Mitigations Built Into Structure

| Risk | Mitigation in Structure |
|------|------------------------|
| Generated types drift | `database.types.ts` in models, CI regeneration |
| Share before auth | `pending-share.service.ts` persists to localStorage |
| Auth not ready on deep link | `auth-ready.resolver.ts` waits for init |
| Missing loading/error states | Dedicated shared components added |
| Offline UX unclear | `offline-indicator.component.ts` added |

---

## 4. Component Standards

### Component Template

```typescript
// drill-card.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Drill } from '../../models/drill.model';
import { TagChipComponent } from '../tags/tag-chip/tag-chip.component';

@Component({
  selector: 'app-drill-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TagChipComponent],
  templateUrl: './drill-card.component.html',
})
export class DrillCardComponent {
  // Inputs using signal-based input()
  drill = input.required<Drill>();

  // Outputs using output()
  deleted = output<string>();

  onDelete(): void {
    this.deleted.emit(this.drill().id);
  }
}
```

```html
<!-- drill-card.component.html -->
<article class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
  <a [routerLink]="['/drills', drill().id]" class="block">
    <h3 class="font-semibold text-gray-900 truncate">{{ drill().title }}</h3>
    <p class="text-sm text-gray-500 mt-1">{{ drill().created_at | date:'mediumDate' }}</p>
  </a>

  <div class="flex flex-wrap gap-1 mt-3">
    @for (tag of drill().system_tags; track tag.id) {
      <app-tag-chip [tag]="tag" [isSystem]="true" />
    }
    @for (tag of drill().user_tags; track tag.id) {
      <app-tag-chip [tag]="tag" [isSystem]="false" />
    }
  </div>
</article>
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Component files | `kebab-case.component.ts` | `drill-card.component.ts` |
| Component class | `PascalCase` + `Component` | `DrillCardComponent` |
| Component selector | `app-kebab-case` | `app-drill-card` |
| Service files | `kebab-case.service.ts` | `drill.service.ts` |
| Service class | `PascalCase` + `Service` | `DrillService` |
| Model files | `kebab-case.model.ts` | `drill.model.ts` |
| Model interface | `PascalCase` | `Drill`, `SystemTag` |
| State files | `kebab-case.state.ts` | `drills.state.ts` |
| Guard files | `kebab-case.guard.ts` | `auth.guard.ts` |

### Angular 19+ Patterns

| Feature | Usage |
|---------|-------|
| `input()` / `input.required()` | Signal-based inputs |
| `output()` | Signal-based outputs |
| `@for` / `@if` / `@switch` | Built-in control flow |
| `computed()` | Derived state from signals |
| `effect()` | Side effects from signal changes |
| Standalone components | All components (no NgModules) |

### Component Checklist

- [ ] Standalone (`standalone: true`)
- [ ] Signal-based `input()` and `output()`
- [ ] `@for`/`@if` control flow (not `*ngFor`/`*ngIf`)
- [ ] Corresponding `.spec.ts` test file
- [ ] Selector: `app-component-name`
- [ ] Tailwind classes (no component CSS files)

---

## 5. State Management

### Store Structure

```
app/state/
  auth.state.ts          # User session, auth status (foundation)
  tags.state.ts          # System tags, user tags
  drills.state.ts        # Drill list, selected drill
  ui.state.ts            # Filters, search, loading states
```

### Signal Store Pattern

```typescript
// drills.state.ts
import { Injectable, computed, signal } from '@angular/core';
import { Drill } from '../models/drill.model';

export interface DrillsStateModel {
  drills: Drill[];
  selectedDrillId: string | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class DrillsState {
  // Private writable signal
  private state = signal<DrillsStateModel>({
    drills: [],
    selectedDrillId: null,
    loading: false,
    error: null,
  });

  // Public readonly selectors
  readonly drills = computed(() => this.state().drills);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Derived selectors
  readonly selectedDrill = computed(() =>
    this.state().drills.find(d => d.id === this.state().selectedDrillId) ?? null
  );

  // Actions
  setDrills(drills: Drill[]): void {
    this.state.update(s => ({ ...s, drills, loading: false }));
  }

  addDrill(drill: Drill): void {
    this.state.update(s => ({ ...s, drills: [drill, ...s.drills] }));
  }

  updateDrill(updated: Drill): void {
    this.state.update(s => ({
      ...s,
      drills: s.drills.map(d => (d.id === updated.id ? updated : d)),
    }));
  }

  removeDrill(id: string): void {
    this.state.update(s => ({
      ...s,
      drills: s.drills.filter(d => d.id !== id),
    }));
  }
}
```

### State Dependency Direction

```
Components → UiState → DrillsState → TagsState → AuthState
```

Each layer can only import from layers to its right.

### Rationale

| Decision | Reason |
|----------|--------|
| Injectable signal stores | Simple DI, tree-shakeable, testable |
| Private `state` signal | Prevents external mutation |
| `computed()` selectors | Reactive, memoized, lazy evaluation |
| Explicit action methods | Clear API, easy to trace changes |
| No external library | Signals sufficient for app complexity |

---

## 6. API Integration

### Supabase Client Configuration

```typescript
// supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Database } from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient<Database> | null = null;

  constructor() {
    if (this.isConfigured()) {
      this.supabase = createClient<Database>(
        environment.supabase.url,
        environment.supabase.anonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      );
    }
  }

  isConfigured(): boolean {
    return !!(environment.supabase?.url && environment.supabase?.anonKey);
  }

  getClient(): SupabaseClient<Database> | null {
    return this.supabase;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase?.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}
```

### Service Template

```typescript
// drill.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DrillsState } from '../state/drills.state';
import { Drill } from '../models/drill.model';

@Injectable({ providedIn: 'root' })
export class DrillService {
  private supabase = inject(SupabaseService);
  private drillsState = inject(DrillsState);

  async loadDrills(): Promise<void> {
    this.drillsState.setLoading(true);
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      const { data, error } = await client
        .from('drills')
        .select(`
          *,
          drill_system_tags(system_tags(*)),
          drill_user_tags(user_tags(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.drillsState.setDrills(this.mapResponse(data));
    } catch (error) {
      this.drillsState.setError(this.getErrorMessage(error));
    }
  }

  async createDrill(input: CreateDrillInput): Promise<Drill | null> {
    // Insert drill, associate tags, return full drill
  }

  async deleteDrill(id: string): Promise<boolean> {
    // Delete and update state
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unexpected error';
  }
}
```

### Service Patterns

| Pattern | Usage |
|---------|-------|
| Inject state stores | Services update state after API calls |
| Typed client | `SupabaseClient<Database>` for autocomplete |
| Error handling | Centralized, state stores error messages |
| Auth listener | Single subscription updates AuthState |

---

## 7. Routing

### Route Configuration

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { authReadyResolver } from './resolvers/auth-ready.resolver';
import { drillExistsGuard } from './guards/drill-exists.guard';

export const appRoutes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/auth/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/auth/password-reset/password-reset.component').then(
        m => m.PasswordResetComponent
      ),
  },
  {
    path: 'share',
    loadComponent: () =>
      import('./components/drills/share-handler/share-handler.component').then(
        m => m.ShareHandlerComponent
      ),
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    resolve: { authReady: authReadyResolver },
    children: [
      { path: '', redirectTo: 'drills', pathMatch: 'full' },
      {
        path: 'drills',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/drills/drill-list/drill-list.component').then(
                m => m.DrillListComponent
              ),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./components/drills/drill-form/drill-form.component').then(
                m => m.DrillFormComponent
              ),
          },
          {
            path: ':id',
            canActivate: [drillExistsGuard],
            loadComponent: () =>
              import('./components/drills/drill-detail/drill-detail.component').then(
                m => m.DrillDetailComponent
              ),
          },
          {
            path: ':id/edit',
            canActivate: [drillExistsGuard],
            loadComponent: () =>
              import('./components/drills/drill-form/drill-form.component').then(
                m => m.DrillFormComponent
              ),
          },
        ],
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./components/tags/tag-manager/tag-manager.component').then(
            m => m.TagManagerComponent
          ),
      },
    ],
  },

  // Not found
  {
    path: 'not-found',
    loadComponent: () =>
      import('./components/shared/not-found/not-found.component').then(
        m => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
```

### Auth Ready Resolver (Reactive)

```typescript
// resolvers/auth-ready.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthState } from '../state/auth.state';

export const authReadyResolver: ResolveFn<boolean> = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.initialized()) {
    return authState.isAuthenticated() || router.createUrlTree(['/login']);
  }

  return toObservable(authState.initialized).pipe(
    filter(init => init),
    take(1),
    timeout(5000),
    map(() => authState.isAuthenticated() || router.createUrlTree(['/login'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
```

### Share Target Service (Consolidated)

```typescript
// services/share-target.service.ts
@Injectable({ providedIn: 'root' })
export class ShareTargetService {
  private readonly STORAGE_KEY = 'session-stash-pending-share';

  handleIncomingShare(url: string | null, title: string | null): void {
    if (!url) {
      this.router.navigate(['/drills']);
      return;
    }
    if (this.authState.isAuthenticated()) {
      this.navigateToAddForm(url, title);
    } else {
      this.storePending({ url, title });
      this.router.navigate(['/login']);
    }
  }

  processPendingShare(): void {
    const pending = this.getPending();
    if (pending) {
      this.clearPending();
      this.navigateToAddForm(pending.url, pending.title);
    }
  }
}
```

### Route Summary

| Route | Auth | Purpose |
|-------|------|---------|
| `/login` | No | Sign in |
| `/signup` | No | Create account |
| `/reset-password` | No | Password recovery |
| `/share` | No | PWA share target entry |
| `/drills` | Yes | Browse all drills |
| `/drills/add` | Yes | Add new drill |
| `/drills/:id` | Yes | View drill (validates exists) |
| `/drills/:id/edit` | Yes | Edit drill (validates exists) |
| `/tags` | Yes | Manage custom tags |
| `/not-found` | No | 404 page |

### PWA Share Target Manifest

```json
{
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": { "url": "url", "title": "title", "text": "text" }
  }
}
```

---

## 8. Styling Guidelines

### Approach

- **Primary:** Tailwind CSS utility classes in templates
- **Secondary:** PrimeNG unstyled (Noop) mode + Tailwind
- **No:** Component-scoped CSS files

### Tailwind Configuration

```javascript
// tailwind.config.js
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const sharedPreset = require('../../libs/tailwind-preset/src/index');

module.exports = {
  presets: [sharedPreset],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
      },
    },
  },
};
```

### Global Styles (styles.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { @apply antialiased; }
  body { @apply bg-gray-50 text-gray-900; }
  html, body { min-height: 100dvh; }
}

@layer components {
  /* Cards */
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4;
  }

  /* Buttons */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors
           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
           min-h-11 min-w-11;
  }
  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500;
  }
  .btn-secondary {
    @apply btn bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500;
  }
  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500;
  }

  /* Form inputs */
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:border-transparent placeholder:text-gray-400;
  }
  .input-error { @apply input border-red-500 focus:ring-red-500; }
  .error-message { @apply text-sm text-red-600 mt-1; }

  /* Tag chips (with icon distinction for accessibility) */
  .tag-chip {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  .tag-chip-system {
    @apply tag-chip bg-primary-100 text-primary-800 before:content-['●'] before:mr-1 before:text-primary-500;
  }
  .tag-chip-user {
    @apply tag-chip bg-blue-100 text-blue-800 before:content-['○'] before:mr-1 before:text-blue-500;
  }
  .tag-chip-selected { @apply ring-2 ring-offset-1 ring-primary-500; }
  .tag-list { @apply flex flex-wrap gap-1.5 max-h-24 overflow-y-auto; }

  /* Loading states */
  .skeleton { @apply bg-gray-200 animate-pulse rounded; }
  .loading-overlay {
    @apply absolute inset-0 bg-white/80 flex items-center justify-center z-10;
  }
}

@layer utilities {
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
  .safe-top { padding-top: env(safe-area-inset-top); }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse, .transition-all, .transition-colors, .transition-shadow {
    animation: none !important;
    transition: none !important;
  }
}
```

### PrimeNG Integration

```typescript
// app.config.ts - Use Noop (unstyled) theme
providePrimeNG({
  theme: {
    preset: Noop,
    options: { darkModeSelector: false, cssLayer: false },
  },
})
```

### Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | 600+ shades for text on light backgrounds |
| Focus indicators | `focus-visible:` ring (keyboard only) |
| Touch targets | Minimum 44x44px (`min-h-11 min-w-11`) |
| Screen reader | `.sr-only` for icon-only buttons |
| Colorblind safe | Icon distinction on tag chips (● vs ○) |
| Reduced motion | `prefers-reduced-motion` media query |

---

## 9. Testing Requirements

### Testing Strategy

| Layer | Approach | Tools |
|-------|----------|-------|
| **Unit** | Mock everything external | Jest + test utilities |
| **Integration** | Real state, mock Supabase | Jest + MockSupabaseBuilder |
| **E2E** | Real app, test Supabase project | Playwright + auth persistence |
| **Offline** | Network simulation | `context.setOffline()` |

### Test Utilities

```typescript
// test-utils/component-harness.ts
export function setInputs<T>(
  fixture: ComponentFixture<T>,
  inputs: Record<string, unknown>
): void {
  Object.entries(inputs).forEach(([key, value]) => {
    fixture.componentRef.setInput(key, value);
  });
  fixture.detectChanges();
}

// test-utils/mock-supabase.ts
export class MockSupabaseBuilder {
  private response = { data: null, error: null };

  withData(data: any): this { this.response.data = data; return this; }
  withError(message: string): this { this.response.error = { message }; return this; }

  build(): jest.Mocked<SupabaseClient> {
    return {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue(this.response),
      single: jest.fn().mockResolvedValue(this.response),
    } as any;
  }
}
```

### E2E Auth Persistence

```typescript
// e2e/global-setup.ts
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL('/drills');

  await page.context().storageState({ path: './e2e/.auth/user.json' });
  await browser.close();
}
```

### Test Coverage Priority

| Priority | Area | Target |
|----------|------|--------|
| Critical | Auth flows, drill CRUD | 90%+ |
| High | Tag filtering, search | 80%+ |
| Medium | UI components | 70%+ |
| Low | Utilities | 60%+ |

### Running Tests

```bash
nx test session-stash              # Unit tests
nx test session-stash --coverage   # With coverage
nx e2e session-stash-e2e           # E2E tests
nx e2e session-stash-e2e --headed  # E2E visible browser
```

---

## 10. Environment Configuration

### Environment Files Strategy

| File | Purpose | Committed? |
|------|---------|------------|
| `.env.example` | Template for developers | ✅ Yes |
| `.env.local` | Local dev secrets | ❌ No |
| `environment.ts` | Dev config (placeholders) | ✅ Yes |
| `environment.prod.ts` | Prod config (placeholders) | ✅ Yes |
| `scripts/set-env.js` | Build-time injection | ✅ Yes |

### Environment Template

```typescript
// environments/environment.ts (safe to commit)
export const environment = {
  production: false,
  supabase: {
    url: '__SUPABASE_URL__',
    anonKey: '__SUPABASE_ANON_KEY__',
  },
  app: {
    name: 'Session Stash',
    version: '0.0.1',
  },
};
```

### Build-Time Injection Script

```javascript
// scripts/set-env.js
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const envConfig = `
export const environment = {
  production: ${process.env.PRODUCTION || false},
  supabase: {
    url: '${process.env.SUPABASE_URL}',
    anonKey: '${process.env.SUPABASE_ANON_KEY}',
  },
  app: {
    name: 'Session Stash',
    version: '${process.env.npm_package_version || '0.0.1'}',
  },
};
`;

fs.writeFileSync('./apps/session-stash/src/environments/environment.ts', envConfig);
console.log('✅ Environment generated');
```

### Environment Validation

```typescript
// services/environment.service.ts
@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  validate(): void {
    const errors: string[] = [];
    if (!environment.supabase?.url?.startsWith('http')) {
      errors.push('SUPABASE_URL not configured');
    }
    if (!environment.supabase?.anonKey || environment.supabase.anonKey.includes('__')) {
      errors.push('SUPABASE_ANON_KEY not configured');
    }
    if (errors.length && environment.production) {
      throw new Error(`Config errors: ${errors.join(', ')}`);
    }
  }
}
```

### .env.example

```bash
# Copy to .env.local and fill in values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "node scripts/set-env.js && nx build session-stash --configuration=production",
  "outputDirectory": "dist/apps/session-stash/browser"
}
```

### PWA Manifest

```json
{
  "name": "Session Stash",
  "short_name": "SessionStash",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#16a34a",
  "background_color": "#f9fafb",
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": { "url": "url", "title": "title", "text": "text" }
  }
}
```

### Local Development

```bash
cp .env.example .env.local     # Create local env
code .env.local                 # Add your keys
node scripts/set-env.js         # Generate environment.ts
nx serve session-stash          # Start dev server
```

---

## 11. Frontend Developer Standards

### Critical Coding Rules

| Rule | Reason |
|------|--------|
| Always use standalone components | No NgModules; tree-shakeable |
| Use `input()` / `output()` | Not `@Input()` / `@Output()` |
| Use `@for` / `@if` control flow | Not `*ngFor` / `*ngIf` |
| Always include `track` in `@for` | Prevents unnecessary re-renders |
| Use `inject()` function | Not constructor injection |
| Never subscribe in components | Use `async` pipe or `toSignal()` |
| Never mutate state directly | Use `state.update()` |
| Always check Supabase client null | Client may not be initialized |
| Use Tailwind utilities | No component CSS files |
| Use `focus-visible:` | Not `focus:` for keyboard focus |

### Common Patterns

```typescript
// Signal-based component
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (item of items(); track item.id) {
      <div>{{ item.name }}</div>
    }
  `,
})
export class ExampleComponent {
  items = input.required<Item[]>();
  selected = output<Item>();
}

// State store
@Injectable({ providedIn: 'root' })
export class ExampleState {
  private state = signal<Model>(initial);
  readonly items = computed(() => this.state().items);
  setItems(items: Item[]) {
    this.state.update(s => ({ ...s, items }));
  }
}

// Service with Supabase
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private supabase = inject(SupabaseService);
  async load() {
    const client = this.supabase.getClient();
    if (!client) return;
    const { data, error } = await client.from('table').select('*');
    if (!error) this.state.setItems(data);
  }
}
```

### Quick Reference

```bash
# Serve
nx serve session-stash

# Build
nx build session-stash --configuration=production

# Test
nx test session-stash
nx e2e session-stash-e2e

# Generate
nx g @nx/angular:component name --project=session-stash
nx g @nx/angular:service name --project=session-stash
```

### File Naming

| Type | Pattern |
|------|---------|
| Component | `kebab-case.component.ts` |
| Service | `kebab-case.service.ts` |
| State | `kebab-case.state.ts` |
| Model | `kebab-case.model.ts` |
| Guard | `kebab-case.guard.ts` |

---

_Document generated by Winston (Architect) - BMad Method_
