# Session Log: Admin Project Locking + Inline Selection Planning

**Date:** 2026-01-21
**Time:** ~00:00 - 00:32 PST
**Duration:** ~32 minutes
**Role:** Expert Planner

---

## Objective

Create a comprehensive implementation plan for two related admin dashboard improvements:
1. **Project Lock/Unlock UI** - Allow admins to dynamically lock/unlock projects
2. **Inline Project Selection** - Replace modal with inline checkboxes for viewer management

---

## Context Gathering

### Files Read at Session Start

User provided context from previous session documents:
- `docs/implementation/PROJECT_SELECTION_UI_PLAN.md` - Completed feature (modal approach)
- `docs/session-logs/2026-01-20-project-selection-ui-planning.md` - Previous session details
- `COMMS.md` - Handoff document showing feature complete
- `QUICKSTART.md` - Project state (deployed, live at designed.cloud)

### Why This Feature Was Needed

From TODO.md refinements identified during Project Selection UI implementation:
- "Admin UI to choose which projects are locked/unlocked globally"
- "Inline approval UI - Consider inline checkboxes instead of modal for reduced clicks"

---

## Phase 1: Codebase Exploration

### Exploration Agents Launched (Parallel)

| Agent | Focus | Key Findings |
|-------|-------|--------------|
| 1 | Project locking system | `locked` is static in `projects.ts`, used in 6+ places |
| 2 | Admin dashboard structure | Modal-driven, useState hooks, per-item loading states |

### Current Architecture Discovered

**Project Locking (Static):**
```
projects.ts → locked: boolean
     ↓
ProjectGrid.tsx → shows lock/check badges
     ↓
projects/[id]/page.tsx → gates access
     ↓
/admin/api/locked-projects → filters for admin UI
```

**Problem:** `projects.ts` is static - cannot be modified at runtime.

**Viewer Access Flow (Modal):**
```
Admin clicks "Approve"
     ↓
openApproveModal() → shows ProjectSelectionModal
     ↓
User selects projects → clicks Confirm
     ↓
handleApproveWithProjects() → API calls
```

**Problem:** 3 clicks required, context switch to modal overlay.

---

## Phase 2: Design Decisions

### Decision 1: Where to Store Lock State?

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A: Modify `projects.ts` at runtime | Direct | Not possible - static file | **Rejected** |
| B: Redis as single source of truth | Simple concept | Requires migration, no fallback | **Rejected** |
| C: Redis override + static fallback | No migration, graceful degradation | Slightly complex | **Chosen** |

**Why Option C:**
- Zero data migration on deploy
- If Redis fails, static values still work
- Only explicit admin actions create Redis entries
- Clear audit trail

**Redis Key Structure:**
```
project-lock:{projectId} → boolean | null (absent = use static)
```

### Decision 2: Modal vs Inline for Viewer Selection?

| Modal Approach | Inline Approach |
|----------------|-----------------|
| 3 clicks: Approve → Select → Confirm | 1-2 clicks: Check boxes → Approve |
| Context switch (overlay) | Stay in context |
| Can't see other viewers | Full dashboard visible |
| Extra component | Simpler tree |

**Why Inline:**
- Faster workflow for admins
- More elegant UX
- Reduces code complexity (delete modal component)
- User specifically requested "elegant inline UI"

---

## Phase 3: Plan Document Creation

### Initial Plan Created

File: `docs/implementation/ADMIN_PROJECT_LOCKING_PLAN.md`

Included:
- Problem statement
- Technical approach (Redis override)
- 5 implementation phases
- File changes summary
- UI wireframes
- Edge cases
- Testing checklist

### User Feedback: "Is plan detailed enough for cold-start builder?"

**Answer:** No - needed more detail.

### Plan Enhanced With:

1. **Prerequisites Section**
   - Environment setup (dev server, admin login, Redis console)
   - Key files to read first
   - Current locked projects reference

2. **Full Code Implementations**
   - `InlineProjectSelector.tsx` - Complete 100+ line component
   - `toggle-lock/route.ts` - Full API with validation
   - `projects/route.ts` - Full API implementation

3. **Implementation Sequence (10 Steps)**
   - Each step has bash commands
   - Each step has verification instructions
   - Manual test examples included

4. **UI Wireframes**
   - Project Settings (toggle switches)
   - Pending Viewer Card (inline checkboxes)
   - Approved Viewer Card (collapsed + expanded)

---

## Key Technical Decisions

### 1. Core Helper Function

**File:** `src/lib/auth/projects.ts`

```typescript
async function isProjectLocked(projectId: string): Promise<boolean> {
  // 1. Check Redis for override
  const override = await redis.get(`project-lock:${projectId}`);
  if (override !== null) return override;

  // 2. Fall back to static
  const project = projects.find(p => p.id === projectId);
  return project?.locked === true;
}
```

**Why this pattern:**
- Single source of truth for lock checks
- All 6+ places that check `locked` can use this
- Encapsulates Redis + static fallback logic

### 2. InlineProjectSelector Component

**Why create a separate component:**
- Reusable for both pending and approved viewer cards
- Encapsulates checkbox state logic
- Same logic as modal but inline rendering
- Can be tested in isolation

**Key behavior:**
- `selectedProjects: []` = "All projects" (empty array convention)
- `requestedProject` pre-selects for pending viewers
- Mutual exclusivity: "All" unchecks individual, individual unchecks "All"

### 3. Expandable Approved Viewer Cards

**Why expand/collapse instead of always showing:**
- Approved viewers are "done" - don't need constant attention
- Collapsed shows summary: "Access: Roblox (NUX)"
- Expand only when editing - keeps dashboard clean
- Matches mental model: pending = active, approved = archived

---

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `docs/implementation/ADMIN_PROJECT_LOCKING_PLAN.md` | Full implementation plan | ~500 |
| `docs/session-logs/2026-01-21-admin-project-locking-planning.md` | This session log | ~300 |

---

## Plan Summary

### New Files to Create (4)

| File | Purpose |
|------|---------|
| `src/lib/auth/projects.ts` | Core helpers: isProjectLocked, getLockedProjectIds, setProjectLockState |
| `src/app/admin/api/toggle-lock/route.ts` | POST endpoint for lock toggle |
| `src/app/admin/api/projects/route.ts` | GET all projects with status |
| `src/components/InlineProjectSelector.tsx` | Reusable inline checkbox component |

### Files to Modify (8)

| File | Change |
|------|--------|
| `src/lib/auth/types.ts` | Add `ProjectWithStatus` type |
| `src/lib/auth/index.ts` | Export new functions |
| `src/app/admin/api/locked-projects/route.ts` | Use `getLockedProjectIds()` |
| `src/app/admin/api/update-access/route.ts` | Use `getLockedProjectIds()` |
| `src/components/ProjectGrid.tsx` | Use `isProjectLocked()` |
| `src/app/projects/[id]/page.tsx` | Use `isProjectLocked()` |
| `src/app/admin/AdminDashboard.tsx` | Add Project Settings + inline selectors |

### Files to Delete (1)

| File | Reason |
|------|--------|
| `src/components/ProjectSelectionModal.tsx` | Replaced by inline UI |

---

## Implementation Sequence Overview

1. Create core helper (`projects.ts`)
2. Update types and exports
3. Create toggle-lock API
4. Create projects API
5. Update existing APIs to use helpers
6. Update access control (ProjectGrid, project page)
7. Create InlineProjectSelector
8. Update AdminDashboard (Project Settings + inline)
9. Delete modal component
10. Full integration test

Each step has verification instructions in the plan.

---

## Why These Design Choices

### Why Redis Override Instead of Full Migration?

**Scenario:** Admin has never touched lock settings.

| Full Migration | Override Approach |
|----------------|-------------------|
| Must populate Redis with all current lock values on deploy | Nothing to do - static values work |
| If Redis data lost, all lock info lost | If Redis data lost, static values still work |
| Every project needs Redis entry | Only changed projects have Redis entries |

**Override is more resilient and simpler to deploy.**

### Why Delete Modal Instead of Keep Both?

**Considered:** Keep modal for "power users" who prefer it.

**Rejected because:**
- Two UIs = two code paths to maintain
- Confuses users - which should I use?
- Inline is strictly better (fewer clicks, same functionality)
- Modal component is 175 lines that can be deleted

### Why Inline Checkboxes Always Visible for Pending?

**Considered:** Collapse pending viewer details too.

**Rejected because:**
- Pending viewers need action - admin should see options immediately
- Reduces clicks (no expand step before approving)
- Visually distinguishes pending (needs attention) from approved (done)

---

## Testing Strategy

### Unit-Level Verification

Each implementation step has `npx tsc --noEmit` check.

### API-Level Verification

Browser console tests for:
- `POST /admin/api/toggle-lock` - toggle Jarvis to locked
- `GET /admin/api/projects` - returns all 5 with status

### Integration Verification

Manual checklist with 20 items covering:
- Project locking (10 tests)
- Inline selection (10 tests)

---

## Session Outcome

**Deliverable:** Comprehensive implementation plan at:
`docs/implementation/ADMIN_PROJECT_LOCKING_PLAN.md`

**Plan includes:**
- Prerequisites for cold-start builder
- Full code for all new files
- Step-by-step implementation sequence
- Verification instructions for each step
- UI wireframes
- 20-item testing checklist

**Status:** Ready for builder to implement

---

## Next Steps (For Builder)

1. Read the full plan at `docs/implementation/ADMIN_PROJECT_LOCKING_PLAN.md`
2. Start dev server: `npm run dev`
3. Login as admin: `godwinjohnson@me.com`
4. Follow 10-step implementation sequence
5. Run through testing checklist
6. Delete `ProjectSelectionModal.tsx` after verification

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [ADMIN_PROJECT_LOCKING_PLAN.md](../implementation/ADMIN_PROJECT_LOCKING_PLAN.md) | Full implementation plan |
| [PROJECT_SELECTION_UI_PLAN.md](../implementation/PROJECT_SELECTION_UI_PLAN.md) | Previous feature (modal approach) |
| [ADMIN_PROJECT_LOCKING_REVIEW.md](../review/ADMIN_PROJECT_LOCKING_REVIEW.md) | Expert review with required updates |
| [TODO.md](../../TODO.md) | Feature backlog |
| [COMMS.md](../../COMMS.md) | Handoff document |

---

# Phase 4: Expert Review Session

**Time:** Later on 2026-01-21
**Role:** Expert Reviewer

---

## What Was Done

Conducted a comprehensive expert review of the implementation plan using three parallel sub-agents to analyze different aspects of the plan against the existing codebase.

### Review Agents Launched (Parallel)

| Agent | Focus Area | Files Analyzed |
|-------|------------|----------------|
| 1 | Auth patterns & API consistency | `redis.ts`, `types.ts`, `index.ts`, API routes |
| 2 | Project access control logic | `projects.ts`, `ProjectGrid.tsx`, `[id]/page.tsx` |
| 3 | Modal replacement completeness | `ProjectSelectionModal.tsx`, `AdminDashboard.tsx` |

### Review Output Created

**File:** `docs/review/ADMIN_PROJECT_LOCKING_REVIEW.md`

Contains:
- Pattern consistency validation (all passed)
- Security validation (all passed)
- 5 required plan updates identified
- 2 suggested improvements
- Pre-implementation checklist
- Conditional approval with action items

---

## Why Expert Review Was Needed

1. **Cold-start builder risk** - Plan needed validation that a new builder could follow it without getting stuck
2. **Pattern consistency** - Ensure new code follows existing conventions (Redis keys, API structure, state management)
3. **Security verification** - Confirm no security regressions in access control
4. **Completeness check** - Identify any missing pieces before builder starts

---

## Key Findings

### What Passed (95% of plan)

| Area | Status | Notes |
|------|--------|-------|
| Redis key naming | ✅ Consistent | `project-lock:{id}` matches `viewer:{email}` pattern |
| API route structure | ✅ Consistent | Admin check → validate → Redis → response |
| TypeScript types | ✅ Consistent | `ProjectWithStatus` follows existing patterns |
| Security checks | ✅ Preserved | All admin auth, input validation, server-side checks |
| InlineProjectSelector design | ✅ Complete | Covers all modal functionality |

### What Needs Updating (5 items)

| # | Issue | Priority | Why It Matters |
|---|-------|----------|----------------|
| 1 | Missing helper function implementations | **HIGH** | Builder blocked without `updatePendingSelection`, `hasChanges`, etc. |
| 2 | Edit mode cancellation behavior undefined | **HIGH** | UX ambiguity - what happens when collapsing without saving? |
| 3 | Humanics lock status unclear | **HIGH** | `confidential: true` but NOT `locked: true` - intentional? |
| 4 | Approve button missing disabled state | MEDIUM | Should be disabled when nothing selected |
| 5 | `actionLoading` state not defined | MEDIUM | Need loading state for viewer operations |

---

## Why These Gaps Matter

### 1. Helper Functions (HIGH)

**Problem:** Plan shows JSX calling functions that don't exist:
```tsx
onChange={(projects) => updatePendingSelection(viewer.email, projects)}
onClick={() => handleApproveWithSelection(viewer.email)}
disabled={!hasChanges(viewer.email)}
```

**Impact:** Builder will hit TypeScript errors immediately, must infer implementations.

**Solution:** Review document includes full implementations for all 7 helper functions.

### 2. Edit Cancellation (HIGH)

**Problem:** Plan shows expand/collapse but doesn't specify:
- What if admin makes changes then clicks another viewer's Edit?
- What if admin clicks Revoke while in edit mode?
- Is there a Cancel button?

**Impact:** Builder makes arbitrary decisions that may not match expected UX.

**Solution:** Review document specifies: collapse = discard changes (matches modal backdrop-click).

### 3. Humanics Lock Status (HIGH)

**Problem:** Discovered during review:
```
humanics-calendar-sharing → confidential: true, locked: NOT SET
humanics-swap-withdraw    → confidential: true, locked: NOT SET
jarvis                    → locked: NOT SET
```

**Impact:** These are publicly viewable despite being "confidential" - is this intentional?

**Solution:** Planner must clarify with stakeholder or document this is expected.

---

## Review Outcome

### Status: CONDITIONALLY APPROVED

**Meaning:** Plan is architecturally sound but has implementation gaps that would block builder.

### Action Required Before Building

1. Planner updates plan with helper function implementations
2. Planner adds edit mode cancellation documentation
3. Stakeholder confirms humanics lock status (or planner notes it's out of scope)

### After Updates

- Builder can proceed with Phases 1-4 immediately
- Phase 5 proceeds after items 4-5 also addressed

---

## Lessons Learned

### What Worked Well

- **Parallel agent analysis** - 3 agents reviewing different aspects simultaneously was efficient
- **Pattern-based validation** - Checking new code against existing patterns caught no inconsistencies
- **Security-first review** - Explicitly validating security patterns preserved

### What to Improve

- **Plan templates** - Should include "helper functions" section by default for UI changes
- **UX edge cases** - Plans should document cancel/discard behavior explicitly
- **Data consistency checks** - Review should flag when static data has unexpected states

---

## Updated Status

| Phase | Status | Owner |
|-------|--------|-------|
| 1. Planning | ✅ Complete | Planner |
| 2. Enhancement | ✅ Complete | Planner |
| 3. Documentation | ✅ Complete | Planner |
| 4. Expert Review | ✅ Complete | Reviewer |
| 5. Plan Updates | ⏳ Pending | Planner |
| 6. Implementation | ⏳ Blocked | Builder |

**Next:** Planner addresses HIGH priority items from review, then builder can proceed.
