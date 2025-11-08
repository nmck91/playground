# Code Patterns and Conventions

## Angular Patterns

**Component Architecture**:
- **Standalone components** - No NgModules
- **inject() function** - Modern dependency injection
- **OnPush change detection** - Not explicitly set, could be optimization opportunity

**State Management**:
- **Reward Chart**: RxJS BehaviorSubject pattern with observable streams
  ```typescript
  private chartDataSubject = new BehaviorSubject<ChartData>(initialData);
  public chartData$ = this.chartDataSubject.asObservable();
  ```
- **Family Calendar**: Angular Signals with readonly exposure
  ```typescript
  private events = signal<CalendarEvent[]>([]);
  readonly eventsSignal = this.events.asReadonly();
  ```

**Service Patterns**:
- `providedIn: 'root'` - All services use root injection
- `inject()` for dependency injection in constructors
- Async/await for Supabase operations

## Naming Conventions

**Files**:
- Components: `*.component.ts`, `*.component.html`, `*.component.css`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Kebab-case filenames: `chart-data.service.ts`, `child-card.component.ts`

**TypeScript**:
- PascalCase for classes, interfaces, types
- camelCase for variables, methods
- UPPER_SNAKE_CASE for constants (not heavily used)

**Selectors**:
- Component selectors: `app-*` or `dadai-*` (family-calendar prefix)

## Styling Patterns

**Tailwind Utility-First**:
- Shared design tokens in `libs/tailwind-preset/src/index.ts`
- Component-specific styles use CSS files with custom properties

**CSS Custom Properties**:
- Used for dynamic theming (family member colors)
- Example: `--child-1-color: #87CEEB`

**No CSS-in-JS**: Pure CSS files, no styled-components or emotion

---
