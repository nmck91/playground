# Technology Stack - Detailed Comparison

## Framework Selection Analysis

### Frontend Framework: Angular 20.3

**Chosen Over**:

| Alternative | Why Rejected | Angular Advantage |
|------------|--------------|-------------------|
| **React** | No built-in DI, need state library | Built-in DI, RxJS, Signals |
| **Vue** | Smaller ecosystem for TypeScript | Superior TypeScript integration |
| **Svelte** | Less enterprise tooling | Mature tooling, Nx integration |
| **Solid** | Smaller community, newer | Proven at scale, large ecosystem |

**Angular Strengths for This Project**:
- ✅ All-in-one framework (no decision fatigue)
- ✅ Excellent TypeScript support
- ✅ Built-in routing, forms, HTTP client
- ✅ Nx first-class support
- ✅ Modern with Signals (fine-grained reactivity)

### Monorepo Tool: Nx

**Chosen Over**:

| Alternative | Why Rejected | Nx Advantage |
|------------|--------------|--------------|
| **Turborepo** | Less Angular-specific features | Angular generators, plugins |
| **Lerna** | Primarily for publishing packages | Build orchestration, caching |
| **Rush** | Complex setup | Simpler configuration |
| **Bazel** | Steep learning curve | Developer-friendly |
| **pnpm workspaces** | Manual task orchestration | Intelligent affected detection |

**Nx Strengths**:
- ✅ Affected command detection
- ✅ Build caching (local + Nx Cloud)
- ✅ Task orchestration with dependencies
- ✅ Code generators for consistency
- ✅ Project graph visualization

### Backend: Supabase

**Chosen Over**:

| Alternative | Why Rejected | Supabase Advantage |
|------------|--------------|-------------------|
| **Firebase** | NoSQL (Firestore) limitations | PostgreSQL (relational) |
| **AWS Amplify** | Complex setup, AWS pricing | Simple setup, generous free tier |
| **PocketBase** | Self-hosted only, newer | Managed service option |
| **Custom (Express+PostgreSQL)** | High maintenance overhead | Zero backend code to write |
| **Hasura** | GraphQL-only complexity | REST + GraphQL + RLS |

**Supabase Strengths**:
- ✅ Full PostgreSQL database
- ✅ Auto-generated REST APIs
- ✅ Built-in auth (not yet used)
- ✅ Real-time subscriptions
- ✅ Open-source (can self-host)

### Styling: Tailwind CSS

**Chosen Over**:

| Alternative | Why Rejected | Tailwind Advantage |
|------------|--------------|-------------------|
| **CSS Modules** | More boilerplate, no design system | Utility-first, shared tokens |
| **styled-components** | Runtime overhead, bundle size | Zero runtime, static CSS |
| **emotion** | Runtime overhead | Static CSS generation |
| **SCSS** | Need to define utilities manually | Pre-built utilities |
| **Vanilla CSS** | No design system | Consistent design tokens |

**Tailwind Strengths**:
- ✅ Shared design system via preset
- ✅ Rapid development with utilities
- ✅ Tree-shaking unused styles
- ✅ No runtime overhead
- ✅ Excellent DX with IntelliSense

### Component Library: PrimeNG

**Chosen Over**:

| Alternative | Why Rejected | PrimeNG Advantage |
|------------|--------------|-------------------|
| **Angular Material** | Less customizable theming | Full control over styling |
| **Ng-Bootstrap** | Bootstrap design limitations | Modern, clean design |
| **Custom Components** | High development time | Production-ready components |
| **Ant Design Angular** | Less Angular-native feel | Built specifically for Angular |

**PrimeNG Strengths**:
- ✅ Rich component set
- ✅ Aura theme integration
- ✅ Works well with Tailwind
- ✅ Accessible components
- ✅ Regular updates

### State Management

**Two Patterns Used** (see ADR 0004):

#### Reward Chart: RxJS BehaviorSubject

**Chosen Over**:
| Alternative | Why Works Here |
|------------|----------------|
| **Signals** | Built before Signals matured |
| **NgRx** | Overkill for app size |
| **Akita** | Additional dependency not needed |

**Best For**:
- Complex async operations
- Multiple derived streams
- Observable composition

#### Family Calendar: Angular Signals

**Chosen Over**:
| Alternative | Why Signals Better |
|------------|-------------------|
| **RxJS** | Simpler state, less boilerplate |
| **NgRx** | Overkill for simple list |
| **Subject** | Signals more ergonomic |

**Best For**:
- Simple synchronous state
- Fine-grained reactivity
- Modern Angular patterns

### Testing

#### Unit Tests: Jest

**Chosen Over**:
| Alternative | Why Rejected | Jest Advantage |
|------------|--------------|----------------|
| **Karma/Jasmine** | Slower, browser-based | Fast, parallel execution |
| **Vitest** | Less Angular tooling | jest-preset-angular |

#### E2E Tests: Playwright

**Chosen Over**:
| Alternative | Why Rejected | Playwright Advantage |
|------------|--------------|---------------------|
| **Protractor** | Deprecated | Modern, maintained |
| **Cypress** | More complex setup | Simpler API, faster |
| **Selenium** | Older API | Modern async/await |

### Deployment

#### Hosting: Vercel

**Chosen Over**:
| Alternative | Why Rejected | Vercel Advantage |
|------------|--------------|------------------|
| **Netlify** | Similar but less Nx-friendly | Better monorepo support |
| **AWS S3+CloudFront** | Complex setup | GitHub integration |
| **Firebase Hosting** | Using Supabase not Firebase | Better DX |
| **GitHub Pages** | Static only, no SPA support | SPA routing works |

**Vercel Strengths**:
- ✅ GitHub integration (auto-deploy)
- ✅ Zero config for SPAs
- ✅ Edge network (fast globally)
- ✅ Preview deployments for PRs
- ✅ Free tier for personal projects

#### CI/CD: GitHub Actions

**Chosen Over**:
| Alternative | Why Rejected | GitHub Actions Advantage |
|------------|--------------|-------------------------|
| **CircleCI** | Additional service | Native GitHub integration |
| **Travis CI** | Less flexible | Better free tier |
| **Jenkins** | Self-hosted complexity | Managed service |

## Bundle Size Impact

| Technology | Bundle Impact | Justification |
|-----------|---------------|---------------|
| **Angular Core** | ~40KB (gzip) | Framework baseline |
| **PrimeNG** | ~300KB (ungzip) | Rich component set |
| **Supabase SDK** | ~80KB | Full backend features |
| **RxJS** | ~25KB | Reactive programming |
| **Tailwind** | ~20KB (purged) | Only used utilities |
| **Total** | ~640KB (ungzip), ~150KB (gzip) | Acceptable for SPA |

**Optimization Opportunities** (not critical for personal use):
- Tree-shake PrimeNG components
- Code-split by route (not yet implemented)
- Lazy load heavy features

## Performance Characteristics

### Build Performance

| Command | Duration | Caching |
|---------|----------|---------|
| `nx build` (cold) | ~8s | None |
| `nx build` (cached) | ~0.1s | Nx cache |
| `nx build` (production) | ~12s | Includes optimization |
| `nx run-many -t build` | ~15s | Parallel execution |

### Development Experience

| Metric | Value |
|--------|-------|
| Dev server startup | ~3s |
| Hot module reload | <1s |
| Type checking | ~2s |
| Lint all apps | ~4s |
| Test all apps | ~6s |

### Runtime Performance

**Lighthouse Scores** (estimated for production builds):
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 100

## Decision Matrix Summary

| Criteria | Weight | Angular | React | Vue |
|----------|--------|---------|-------|-----|
| TypeScript Support | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Nx Integration | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| All-in-one Framework | Medium | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Learning Curve | Low | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ecosystem | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Total Score** | | **23/25** | **19/25** | **21/25** |

## Future Technology Considerations

### Potential Additions

| Technology | Use Case | Priority |
|-----------|----------|----------|
| **Nx Agents** | Distributed task execution | Low (CI fast enough) |
| **Storybook** | Component documentation | Medium |
| **Compodoc** | Auto-generated docs | Low |
| **Sentry** | Error tracking | Medium |
| **PostHog** | Analytics | Low |
| **Zod** | Runtime validation | Medium |

### Potential Migrations

| From | To | Reason | Effort |
|------|----|----|--------|
| RxJS (Reward Chart) | Signals | Consistency | Medium |
| Separate Supabase services | Shared library | DRY | Low |
| No auth | Supabase Auth | Multi-user | Medium |

## References

- [Angular](https://angular.dev/)
- [Nx](https://nx.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PrimeNG](https://primeng.org/)
- [Vercel](https://vercel.com/)
