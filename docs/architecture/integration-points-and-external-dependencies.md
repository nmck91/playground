# Integration Points and External Dependencies

## External Services

| Service | Purpose | Integration Type | Key Files |
|---------|---------|------------------|-----------|
| Supabase | Backend database, auth (future) | Official JS SDK | `apps/*/src/app/services/supabase.service.ts` |
| Vercel | Frontend hosting and deployment | GitHub integration | `vercel.json`, `.vercel/project.json` |
| Nx Cloud | Build caching and task distribution | Nx CLI integration | `nx.json` (nxCloudId: 690bb8b50b43db7aa6c2f781) |
| GitHub Actions | CI/CD pipeline | Workflow YAML | `.github/workflows/ci.yml` |

## Internal Integration Points

- **Shared Design System**: Both apps import Tailwind preset via `require('../../libs/tailwind-preset/src/index.ts')`
- **No Runtime Dependencies**: Apps are independent SPAs, no shared runtime code
- **Build Dependencies**: Both apps depend on workspace-level tooling (ESLint, Jest, Nx)

---
