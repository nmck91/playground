# Football Director - Technology Stack

## Architecture Summary

**Architecture Pattern**: Next.js App Router + Client-Side Game Engine + localStorage Persistence

**Application Type**: Progressive Web App (PWA) - Single Page Application with offline support

## Key Architectural Decisions

- **Client-Side First**: All game logic runs in the browser, no backend server required
- **Engine Separation**: Game logic isolated in separate library (`football-director-engine`)
- **Immutable State**: Game state managed immutably with React hooks
- **Auto-Save**: Game automatically saves to localStorage after every state change
- **Multi-Slot Saves**: Up to 5 save slots with metadata (team, season, position)
- **Progressive Enhancement**: PWA with offline support, installable on mobile/desktop

## Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 15.5.9 | App Router, React Server Components |
| **UI Library** | React | 19.0.0 | Client components, hooks-based architecture |
| **Language** | TypeScript | ~5.9.2 | Strict typing throughout |
| **Styling** | Tailwind CSS | ^3.4.19 | Utility-first CSS with shared workspace preset |
| **Theming** | next-themes | ^0.4.6 | Dark/light mode support |
| **Animation** | Framer Motion | ^12.23.26 | Used for UI transitions and animations |
| **PWA** | next-pwa | ^5.6.0 | Service worker, offline caching, installability |
| **Build Tool** | Nx | ^22.3.2 | Monorepo build orchestration, caching |
| **Package Manager** | npm | - | Workspace dependency management |
| **Testing** | Jest | ^29.7.0 | Unit tests for game engine (some modules) |
| **Linting** | ESLint | ^9.8.0 | Code quality enforcement |

## Repository Structure

**Type**: Nx Monorepo (football-director is one of multiple apps)

**Package Manager**: npm

**Notable**: Football Director uses Next.js/React while other apps in the repo use Angular

## Workspace Dependencies

### Local Libraries
- `@playground/football-director-engine` - Game logic library (24+ TypeScript modules)
- `@playground/tailwind-preset` - Shared Tailwind design tokens

### External Services
- **None** - No database, backend API, authentication, or external services
- All data persists to browser localStorage only
- Fully offline-capable PWA

## Browser APIs Used

1. **localStorage**:
   - Game saves (multi-slot system)
   - Active slot tracking
   - Save metadata

2. **Service Worker** (via next-pwa):
   - Offline caching
   - Resource pre-caching
   - Runtime caching strategies

3. **Web App Manifest**:
   - PWA installability
   - App icons and splash screens
   - Display mode (standalone)

4. **matchMedia** (via next-themes):
   - System theme detection
   - Dark/light mode preference

## Development Tools

- **Nx CLI**: Monorepo commands and build orchestration
- **Next.js Dev Server**: Hot reload, fast refresh
- **React DevTools**: Component tree inspection
- **Nx Console** (VS Code extension): GUI for Nx commands

## Build Process

### Build Pipeline
1. TypeScript compilation
2. Next.js build (App Router)
3. PWA service worker generation (next-pwa)
4. Static optimization
5. Output to `.next/` directory

### Build Configuration Files
- **TypeScript**: `tsconfig.json` (strict mode enabled)
- **Next.js**: `next.config.js` (PWA, SWC compiler)
- **Tailwind**: `tailwind.config.js` (shared preset)
- **Nx**: `project.json` (build orchestration)

## Deployment Considerations

**Current Status**: Development only (not deployed)

**Recommended Platforms**:
- **Vercel**: Optimal choice (Next.js native platform)
- **Netlify**: Works well with Next.js
- **Static Export**: Could use `next export` for pure static hosting
- **Self-Hosted**: Node.js server required

**Requirements**:
- PWA requires HTTPS (except localhost)
- Service worker requires HTTPS
- No backend needed (all client-side)
- No environment variables currently used
- No build-time secrets needed

## Testing Framework

**Engine Tests**:
- Jest 29.7.0
- ts-jest for TypeScript
- Configuration: `jest.config.ts` in engine library
- Coverage: Partial (estimated 20-30% of engine modules)

**Application Tests**:
- Currently no tests for React components
- No integration or E2E tests

## Technical Constraints

### Known Limitations
1. **localStorage Quota**: Browser limits storage to ~5-10MB
2. **No Backend**: No cross-device sync, cloud saves
3. **Client-Side Only**: All logic runs in browser
4. **PWA Testing**: Requires production build (disabled in dev mode)

### Version Notes
- **next-pwa**: Using v5 (v6 exists but not upgraded)
- **Node.js**: Recommend v18+ (not strictly specified)
- **React**: Using latest v19 (new features available)
