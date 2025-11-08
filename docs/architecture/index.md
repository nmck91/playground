# Playground Nx Monorepo - Architecture Documentation

## Core Documentation

- [Introduction](./introduction.md) - Project overview and scope
- [Quick Reference](./quick-reference-key-files-and-entry-points.md) - Critical files and entry points
- [High Level Architecture](./high-level-architecture.md) - System architecture overview
- [Source Tree](./source-tree-and-module-organization.md) - File structure and modules
- [Data Models & APIs](./data-models-and-apis.md) - Data structures and interfaces
- [Technical Debt](./technical-debt-and-known-issues.md) - Known limitations and workarounds
- [Integration Points](./integration-points-and-external-dependencies.md) - External services
- [Development & Deployment](./development-and-deployment.md) - Setup and deployment
- [Testing Reality](./testing-reality.md) - Test coverage and execution
- [Code Patterns](./code-patterns-and-conventions.md) - Coding standards
- [AI Agent Guidelines](./ai-agent-guidelines.md) - AI-specific guidance
- [Version History](./version-history.md) - Recent changes
- [Summary for AI Agents](./summary-for-ai-agents.md) - Quick overview

## Enhanced Documentation

### Visual Architecture
- [System Architecture Diagrams](./system-architecture-diagram.md) - Mermaid diagrams showing:
  - High-level system architecture
  - Component architecture (both apps)
  - Data flow diagrams
  - Deployment architecture
  - Nx project graph
  - Technology stack layers

### Decision Records
- [Architecture Decision Records (ADRs)](./decisions/README.md) - Index of all ADRs
  - [ADR 0001: Use Nx Monorepo](./decisions/0001-use-nx-monorepo.md)
  - [ADR 0002: Angular Standalone Components](./decisions/0002-angular-standalone-components.md)
  - [ADR 0003: Supabase Backend-as-a-Service](./decisions/0003-supabase-backend-as-a-service.md)
  - [ADR 0004: Different State Management Patterns](./decisions/0004-different-state-management-patterns.md)
  - [ADR 0005: Tailwind CSS with Shared Preset](./decisions/0005-tailwind-css-with-shared-preset.md)

### Deep Dives
- [Tech Stack Comparison](./tech-stack-comparison.md) - Detailed technology choices:
  - Framework selection analysis
  - Alternative comparisons
  - Bundle size impact
  - Performance characteristics
  - Decision matrices

### Operational Guides
- [Deployment Playbook](./deployment-playbook.md) - Step-by-step deployment:
  - Pre-deployment checklist
  - Deployment procedures
  - Rollback procedures
  - Environment-specific deployments
  - Common deployment scenarios

- [Troubleshooting Guide](./troubleshooting-guide.md) - Solutions for:
  - Build & development issues
  - Supabase integration issues
  - Test & lint issues
  - Git & CI/CD issues
  - Deployment issues
  - Performance debugging

### Quick Reference
- [Appendix - Commands](./appendix-useful-commands-and-scripts.md) - Frequently used commands

## Documentation Overview

This architecture documentation provides comprehensive information for AI agents working on the Playground Nx monorepo. The documentation is organized into:

1. **Core Documentation**: Essential information about the system
2. **Enhanced Documentation**: Visual diagrams and deep-dive analyses
3. **Decision Records**: Historical context for architectural choices
4. **Operational Guides**: Practical how-to guides for common tasks

## For AI Agents

**Start Here**:
1. Read [Summary for AI Agents](./summary-for-ai-agents.md) for quick overview
2. Review [Quick Reference](./quick-reference-key-files-and-entry-points.md) for file locations
3. Check [AI Agent Guidelines](./ai-agent-guidelines.md) for working practices
4. Consult [System Architecture Diagrams](./system-architecture-diagram.md) for visual understanding

**When Working on Tasks**:
- Check [Code Patterns](./code-patterns-and-conventions.md) for conventions
- Review [Technical Debt](./technical-debt-and-known-issues.md) for known issues
- Use [Troubleshooting Guide](./troubleshooting-guide.md) when stuck
- Follow [Deployment Playbook](./deployment-playbook.md) for releases

**When Making Decisions**:
- Review existing [ADRs](./decisions/README.md) for context
- Check [Tech Stack Comparison](./tech-stack-comparison.md) for rationale
- Create new ADR for significant architectural changes
