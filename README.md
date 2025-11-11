# Playground

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **AI-assisted development playground** - Nx monorepo with Angular applications and automated CI/CD ✨

## 🚀 Applications

All applications now use a **unified Supabase backend** for simplified management and better resource utilization.

### Family Calendar
Family event management system with recurring events support
- **Tech:** Angular 20.3, PrimeNG, Tailwind CSS, Supabase
- **State:** Angular Signals
- **Status:** ✅ Production

### Reward Chart
Kids reward tracking system with star-based achievements
- **Tech:** Angular 20.3, PrimeNG, Tailwind CSS, Supabase
- **State:** RxJS BehaviorSubject
- **Status:** ✅ Production

### Last Player Standing
Football competition app for school PTA fundraiser
- **Tech:** Angular 18, PrimeNG with Aura theme, Tailwind CSS, Supabase, Stripe
- **State:** Angular Signals + inject()
- **Status:** 🚧 Development

## 🔄 CI/CD Workflow

This project uses a **CI-gated release branch** strategy for quality assurance:

### Branches
- **`main`** - Development branch
  - All development happens here
  - CI runs on every push: lint, test, build, e2e
  - Blocked from deploying to production

- **`release`** - Production branch
  - Auto-updated when CI passes on `main`
  - Only contains CI-validated code
  - Triggers production deployments to Vercel

### Workflow
```
Developer Push → main → GitHub Actions CI ✅ → Auto-merge → release → Vercel Deploy 🚀
```

### Deployment Control
Each app's `vercel.json` ensures deployments only trigger from `release` branch:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": false,
      "release": true
    }
  }
}
```

## 📚 Documentation

- **Architecture:** `docs/architecture/` - Comprehensive system documentation
- **Project Briefs:** `docs/brief.md` (Reward Chart), `docs/last-player-standing/README.md`
- **Database Schemas:** `docs/supabase-playground-consolidated-schema.sql` - Unified database schema
- **Supabase Migration:** `docs/SUPABASE-CONSOLIDATION-GUIDE.md` - Step-by-step consolidation guide
- **Deployment:** `docs/architecture/deployment-playbook.md`


## 🛠️ Development

### Quick Start

```bash
# Install dependencies
npm install

# Serve an application
npx nx serve family-calendar    # Port 4200
npx nx serve reward-chart         # Port 4300
npx nx serve last-player-standing # Port 4200

# Build for production
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production
npx nx build last-player-standing --configuration=production

# Run tests
npx nx test family-calendar
npx nx test reward-chart
npx nx test last-player-standing

# Run E2E tests
npx nx e2e family-calendar-e2e
npx nx e2e reward-chart-e2e
npx nx e2e last-player-standing-e2e

# Lint
npx nx lint family-calendar
npx nx run-many -t lint  # Lint all projects
```

### Nx Commands

```bash
# Visualize project dependencies
npx nx graph

# Show project details
npx nx show project family-calendar

# Run tasks for all affected projects
npx nx affected -t test build

# List available plugins
npx nx list
```

## 🧰 Tech Stack

### Core
- **Monorepo:** Nx 22.0.2
- **Framework:** Angular 18-20.3
- **UI Library:** PrimeNG with Aura theme
- **Styling:** Tailwind CSS with shared preset (`libs/tailwind-preset`)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Payments:** Stripe (Last Player Standing only)

### Tooling
- **Package Manager:** npm
- **Build Tool:** Angular CLI with esbuild
- **Testing:** Jest (unit), Playwright (E2E)
- **Linting:** ESLint with angular-eslint
- **TypeScript:** 5.9.2 (strict mode)
- **CI/CD:** GitHub Actions + Vercel

## 🎯 Project Structure

```
playground/
├── apps/
│   ├── family-calendar/          # Event management app
│   ├── family-calendar-e2e/      # E2E tests
│   ├── reward-chart/             # Star tracking app
│   ├── reward-chart-e2e/         # E2E tests
│   ├── last-player-standing/     # Football competition app
│   └── last-player-standing-e2e/ # E2E tests
├── libs/
│   └── tailwind-preset/          # Shared design system
├── docs/
│   ├── architecture/             # System documentation
│   ├── last-player-standing/     # LPS app docs
│   └── stories/                  # Completed work docs
└── .github/workflows/
    └── ci.yml                    # CI/CD pipeline
```

## 🔧 Code Generation

```bash
# Generate a new Angular component
npx nx g @nx/angular:component my-component --project=family-calendar

# Generate a new service
npx nx g @nx/angular:service my-service --project=reward-chart

# Generate a new library
npx nx g @nx/js:library my-lib --directory=libs/my-lib

# Use Nx Console in VS Code for visual generation
```

## 🌟 Key Features

- ✅ **CI-Gated Deployments** - Only CI-validated code reaches production
- ✅ **Shared Design System** - Consistent UI across all apps via Tailwind preset
- ✅ **Modular Architecture** - Well-organized documentation in `docs/architecture/`
- ✅ **Multiple State Patterns** - RxJS, Signals, and inject() patterns demonstrated
- ✅ **AI-Friendly** - Comprehensive documentation optimized for AI agents

## 📖 Learn More

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Supabase Documentation](https://supabase.com/docs)
