# Story 004b: Tactics UI Integration - Squad Page

**Status**: ✅ COMPLETE
**Priority**: High (blocks Story 004 completion)
**Complexity**: Low
**Estimated Duration**: 30-45 minutes
**Assigned To**: Dev Agent (James)
**Created**: 2025-12-25
**Parent Story**: Story 004 - Advanced Tactics System
**Type**: Bug Fix / Integration

---

## Context

Story 004 implemented the full Advanced Tactics system (engine + UI component), but the TacticsManager component was never integrated into any page. Users cannot access the tactics features.

This story completes the integration by adding the TacticsManager modal to the Squad page.

---

## User Story

As a **Football Director player**,
I want **to access the tactics manager from the Squad page**,
So that **I can set my team's formation, mentality, player roles, team instructions, and set piece takers**.

---

## Acceptance Criteria

1. **Button Added to Squad Page**
   - "Change Tactics" button visible in Squad page header
   - Button opens TacticsManager modal
   - Mobile-responsive placement

2. **Modal Integration**
   - TacticsManager component imported and rendered
   - Modal state managed correctly (open/close)
   - Current tactics loaded from gameState.playerTeam.tactics
   - Player list passed to component for set piece selection

3. **Save Functionality**
   - Save button calls actions.setTeamTactics()
   - Tactics persist to gameState
   - Modal closes after save
   - Success feedback shown (optional)

4. **Quality**
   - No TypeScript errors
   - Dark mode works correctly
   - Mobile responsive
   - No regressions to Squad page

---

## Technical Implementation

### File to Modify

**`apps/football-director/src/app/squad/page.tsx`**

### Changes Required

1. **Add imports** (top of file):
```typescript
import { useState } from 'react';
import { TacticsManager } from '../../components/game/TacticsManager';
```

2. **Add modal state** (inside component):
```typescript
const [showTactics, setShowTactics] = useState(false);
```

3. **Add button to header** (in header section around line 50):
```typescript
<button
  onClick={() => setShowTactics(true)}
  className="px-4 py-2 bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
>
  <span>🎯</span>
  <span className="hidden sm:inline">Change Tactics</span>
  <span className="sm:hidden">Tactics</span>
</button>
```

4. **Add TacticsManager component** (before closing div at end):
```typescript
{/* Tactics Manager Modal */}
<TacticsManager
  currentFormation={gameState.playerTeam.tactics.formation}
  currentMentality={gameState.playerTeam.tactics.mentality}
  currentTactics={gameState.playerTeam.tactics}
  players={gameState.playerTeam.players}
  onSave={(tactics) => {
    actions.setTeamTactics(tactics);
    setShowTactics(false);
  }}
  onClose={() => setShowTactics(false)}
  isOpen={showTactics}
/>
```

---

## Definition of Done

- [x] TacticsManager imported into Squad page
- [x] "Change Tactics" button added to header
- [x] Modal state managed correctly
- [x] Button opens modal with current tactics
- [x] Save button updates tactics and closes modal
- [x] Mobile responsive (button text adapts)
- [x] Dark mode compatible
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Tested manually (open, edit, save, cancel) - ✅ **USER APPROVED**
- [x] Story 004 marked complete - ✅ **APPROVED**

---

## Testing Steps

1. **Open Squad Page**
   - Navigate to `/squad`
   - Verify "Change Tactics" button visible in header

2. **Open Modal**
   - Click "Change Tactics" button
   - Modal opens with current tactics loaded
   - Formation and mentality show current values

3. **Edit Tactics**
   - Change formation
   - Change mentality
   - Expand Advanced section
   - Change player roles
   - Change team instructions
   - Select set piece takers

4. **Save Changes**
   - Click "Save Tactics"
   - Modal closes
   - Navigate away and back - verify tactics persisted

5. **Cancel Changes**
   - Open modal again
   - Make changes
   - Click "Cancel"
   - Modal closes
   - Verify changes not saved

6. **Mobile Test**
   - Test on mobile viewport
   - Button shows "Tactics" (shortened text)
   - Modal is scrollable and usable

---

## Success Criteria

- ✅ Users can access advanced tactics from Squad page
- ✅ All tactics features work (formation, mentality, roles, instructions, set pieces)
- ✅ Changes persist across sessions
- ✅ UI is polished and professional
- ✅ Story 004 implementation gap resolved

---

## Time Estimate

**30-45 minutes total:**
- 10 min: Add imports and state
- 10 min: Add button to header
- 10 min: Integrate TacticsManager component
- 5 min: Test functionality
- 5-10 min: Polish and verify mobile

---

## Notes for Dev Agent

- Squad page already has access to `gameState` and `actions` via `useGameState()` hook
- TacticsManager component is fully complete - just needs wiring
- Button placement: Add next to page title in header (see line ~45-60)
- The component is already built to handle all advanced tactics features
- Test with different formations to ensure save works correctly

---

## Related Files

- **Component**: `/apps/football-director/src/components/game/TacticsManager.tsx`
- **Target Page**: `/apps/football-director/src/app/squad/page.tsx`
- **Hook**: `/apps/football-director/src/hooks/useGameState.ts` (provides actions.setTeamTactics)
- **Engine**: `/libs/football-director-engine/src/lib/tactics-manager.ts`
- **Parent Story**: `/docs/football-director/stories/story-004-advanced-tactics.md`

---

**This is a straightforward integration task - wire up existing component to existing page. Should be quick!** ⚡

---

## Dev Agent Record

**Agent Model Used**: Claude Sonnet 4.5
**Implementation Date**: 2025-12-25
**Status**: ✅ COMPLETE

### Completion Notes

1. **Import Added**: Added TacticsManager import to squad page (line 15)
2. **State Management**: Added `showTactics` state variable (line 28)
3. **Button Integration**: Added "Change Tactics" button to header with responsive text:
   - Desktop: "Change Tactics"
   - Mobile: "Tactics"
   - Button placed between page title and theme toggle (lines 160-170)
4. **Modal Integration**: Added TacticsManager component at end of file (lines 492-504)
   - Wired to gameState.playerTeam.tactics with fallback defaults
   - Passes current formation, mentality, tactics, and players
   - Calls actions.setTeamTactics on save
   - Closes modal after save
5. **TypeScript Safety**: Added optional chaining and fallback values for possibly undefined tactics field

### File List

**Modified:**
- `apps/football-director/src/app/squad/page.tsx` - Added tactics manager integration

**Dependencies:**
- `apps/football-director/src/components/game/TacticsManager.tsx` - Existing component (no changes)
- `libs/football-director-engine/src/lib/tactics-manager.ts` - Existing engine (no changes)

### Change Log

- **Line 15**: Added `TacticsManager` import
- **Line 28**: Added `showTactics` state variable
- **Lines 160-170**: Added "Change Tactics" button with responsive text to header
- **Lines 492-504**: Added `TacticsManager` modal component
- **Lines 494-495**: Added optional chaining (`?.`) and fallback defaults for tactics

### Validations Passed

- ✅ ESLint: No errors in squad/page.tsx
- ✅ TypeScript: No compilation errors
- ✅ Build: Successful (nx build football-director)
- ✅ All existing modals still work (PlayerStats, ContractNegotiation)

### Debug Log References

No issues encountered. Implementation was straightforward as designed.

### Ready for Review Checklist

- [x] Code matches requirements
- [x] All validations pass (ESLint, TypeScript, Build)
- [x] Follows project coding standards
- [x] Mobile responsive design maintained
- [x] Dark mode compatibility maintained
- [x] No regressions to existing functionality
- [x] Manual testing by user completed
- [x] Story 004 parent story marked complete
