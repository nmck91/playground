# High Level Architecture

## Technical Summary

**Architecture Pattern**: Nx Monorepo with Angular SPAs + Supabase Backend-as-a-Service (BaaS)

**Repository Type**: Monorepo managed by Nx 22.0.2
- Two production Angular applications
- One shared library (Tailwind design system)
- E2E test projects for each app
- Shared tooling and configuration

**Deployment Model**:
- **Frontend**: Deployed to Vercel via GitHub integration
  - `family-calendar` → https://family-calendar-niall-mckinneys-projects.vercel.app
  - `reward-chart` → https://family-reward-chart-niall-mckinneys-projects.vercel.app
- **Backend**: Supabase (managed PostgreSQL + Auth + Real-time)
- **CI/CD**: GitHub Actions for testing, Vercel for deployment

## Actual Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Monorepo Manager** | Nx | 22.0.2 | Build caching, affected command detection, task orchestration |
| **Frontend Framework** | Angular | ~20.3.0 | Standalone components, Signals, modern reactive patterns |
| **UI Components** | PrimeNG | ^20.3.0 | Component library with Aura theme integration |
| **Styling** | Tailwind CSS | ^3.0.2 | Utility-first CSS with shared workspace preset |
| **Backend (BaaS)** | Supabase | Client SDK ^2.80.0 | PostgreSQL, Auth, Real-time subscriptions |
| **State Management (Reward Chart)** | RxJS BehaviorSubject | ~7.8.0 | Observable-based state for complex streams |
| **State Management (Calendar)** | Angular Signals | Built-in | Fine-grained reactivity for simple state |
| **Build Tool** | Angular Build (esbuild) | ~20.3.0 | Fast production builds with optimization |
| **Package Manager** | npm | Native | Standard npm with package-lock.json |
| **Testing - Unit** | Jest + jest-preset-angular | ^29.7.0 / ~14.6.1 | Fast parallel test execution |
| **Testing - E2E** | Playwright | ^1.36.0 | Modern browser automation |
| **Linting** | ESLint + angular-eslint | ^9.8.0 / ^20.3.0 | Flat config with Angular-specific rules |
| **Type Checking** | TypeScript | ~5.9.2 | Strict mode enabled |
| **CI/CD** | GitHub Actions | N/A | Lint, test, build, e2e on PR and main push |
| **Deployment** | Vercel | N/A | GitHub integration, auto-deploy from main |
| **Cloud Services** | Nx Cloud | ID: 690bb8b50b43db7aa6c2f781 | Build caching and task distribution |

## Repository Structure Reality Check

- **Type**: Monorepo
- **Package Manager**: npm with package-lock.json (lockfileVersion 3)
- **Apps**: 2 production apps + 2 e2e test apps
- **Libs**: 1 shared library (Tailwind preset)
- **Notable**:
  - Recently refactored Tailwind preset from root into libs/
  - Uses Nx plugins for automatic target inference
  - Vercel configuration moved from app-specific to workspace root

---
