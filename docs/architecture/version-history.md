# Version History

## Recent Significant Changes

**Commit accf7f1** (2025-11-08): Refactor Tailwind preset into libs folder
- Moved `tailwind-workspace-preset.js` → `libs/tailwind-preset/src/index.ts`
- Updated both apps to reference new location
- Improved Nx dependency graph visibility

**Commit e3ef66a** (2025-11-08): Move Vercel configuration to repository root
- Fixed deployment by moving `vercel.json` from app-specific to workspace root
- Resolved Vercel root directory issue causing `npm ci` failures

**Commit fc6f403** (2025-11-08): Regenerate package-lock.json to fix Vercel deployment
- Fixed out-of-sync package-lock.json causing build failures
- Ensured npm ci works in Vercel environment

---
