# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant architectural choices made in the Playground Nx monorepo.

## What are ADRs?

Architecture Decision Records document important architectural decisions made during the project, including:
- The context and problem being solved
- Options considered
- The decision made and rationale
- Consequences (positive and negative)
- Implementation details

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](./0001-use-nx-monorepo.md) | Use Nx Monorepo for Workspace Management | Accepted | 2025-11-08 |
| [0002](./0002-angular-standalone-components.md) | Use Angular Standalone Components | Accepted | 2025-11-08 |
| [0003](./0003-supabase-backend-as-a-service.md) | Use Supabase as Backend-as-a-Service | Accepted | 2025-11-08 |
| [0004](./0004-different-state-management-patterns.md) | Different State Management Patterns Per App | Accepted | 2025-11-08 |
| [0005](./0005-tailwind-css-with-shared-preset.md) | Tailwind CSS with Shared Design System Preset | Accepted | 2025-11-08 |

## ADR Status Definitions

- **Proposed**: Under consideration
- **Accepted**: Approved and implemented
- **Deprecated**: No longer relevant but kept for historical context
- **Superseded**: Replaced by a newer ADR

## Creating New ADRs

When making significant architectural decisions:

1. Copy the template (if created)
2. Number sequentially (0006, 0007, etc.)
3. Use format: `NNNN-descriptive-title.md`
4. Include all sections: Context, Decision, Rationale, Consequences
5. Update this index

## Key Decisions Summary

**Technology Choices**:
- Nx Monorepo for workspace organization
- Angular 20.3 with standalone components
- Supabase for backend-as-a-service
- Tailwind CSS for styling

**Patterns & Practices**:
- Mixed state management (RxJS + Signals)
- Shared design system via Tailwind preset
- No authentication (planned future enhancement)

**Infrastructure**:
- Vercel for frontend deployment
- GitHub Actions for CI/CD
- Nx Cloud for build caching

## References

- [ADR GitHub Repo](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
