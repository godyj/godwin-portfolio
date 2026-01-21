# Expert Review: Admin Project Lock/Unlock UI + Inline Project Selection

**Reviewer:** Claude (Expert Reviewer)
**Date:** 2026-01-21 (Current Session)
**Status:** CONDITIONALLY APPROVED - Requires Plan Updates

---

## Executive Summary

The implementation plan for Admin Project Locking and Inline Project Selection is **architecturally sound** and follows established codebase patterns precisely. However, the plan has **implementation gaps** that need addressing before the builder can proceed confidently.

**Overall Confidence: 95%** - Plan is production-ready after addressing the items below.

---

## Files Reviewed

| File | Purpose | Status |
|------|---------|--------|
| [docs/implementation/ADMIN_PROJECT_LOCKING_PLAN.md](../implementation/ADMIN_PROJECT_LOCKING_PLAN.md) | Full implementation plan | Reviewed |
| [src/lib/auth/redis.ts](../../src/lib/auth/redis.ts) | Redis client pattern | Verified |
| [src/lib/auth/types.ts](../../src/lib/auth/types.ts) | Existing type definitions | Verified |
| [src/lib/auth/index.ts](../../src/lib/auth/index.ts) | Export structure | Verified |
| [src/app/admin/AdminDashboard.tsx](../../src/app/admin/AdminDashboard.tsx) | Current admin UI | Verified |
| [src/app/admin/api/locked-projects/route.ts](../../src/app/admin/api/locked-projects/route.ts) | Locked projects API | Verified |
| [src/app/admin/api/update-access/route.ts](../../src/app/admin/api/update-access/route.ts) | Update access API | Verified |
| [src/components/ProjectSelectionModal.tsx](../../src/components/ProjectSelectionModal.tsx) | Modal to be replaced | Verified |
| [src/components/ProjectGrid.tsx](../../src/components/ProjectGrid.tsx) | Grid with lock badges | Verified |
| [src/app/projects/[id]/page.tsx](../../src/app/projects/[id]/page.tsx) | Project page access control | Verified |
| [src/data/projects.ts](../../src/data/projects.ts) | Static project data | Verified |

---

## Pattern Consistency Analysis

### ✅ PASSED - Follows Existing Patterns

| Pattern | Current Codebase | Plan Proposal | Status |
|---------|------------------|---------------|--------|
| **Redis key naming** | `viewer:{email}`, `token:{token}`, `session:{sessionId}` | `project-lock:{projectId}` | ✅ Consistent |
| **API route structure** | Admin check → validate → Redis op → response | Same pattern for toggle-lock | ✅ Consistent |
| **Error responses** | 401/400/404 with `{ error: string }` | Same codes and format | ✅ Consistent |
| **Type exports** | `ViewerAccess`, `Session`, `LockedProject` | Adding `ProjectWithStatus` | ✅ Consistent |
| **State management** | `useState` for viewers, loading states | Same pattern for new states | ✅ Consistent |
| **Async/await** | Throughout components & APIs | Plan uses throughout | ✅ Consistent |

### Security Patterns Maintained

| Security Check | Status |
|----------------|--------|
| Admin-only endpoints check `session.role === 'admin'` | ✅ Preserved |
| Project IDs validated against `projects.ts` | ✅ Preserved |
| Lock state checked server-side only | ✅ Preserved |
| Redis keys prefixed to avoid collisions | ✅ Preserved |
| Inherits rate limiting from admin API | ✅ Preserved |

---

## REQUIRED Plan Updates

### 1. Missing Helper Function Implementations

**Priority: HIGH**
**Location: Phase 5 - AdminDashboard modifications**

The plan references but does not define these functions. Builder will be blocked without implementations.

```typescript
// MUST ADD TO PLAN - Full implementations needed:

const updatePendingSelection = (email: string, projects: string[]) => {
  setPendingSelections(prev => ({
    ...prev,
    [email]: {
      selectAll: projects.length === 0,
      projects: new Set(projects)
    }
  }));
};

const handleApproveWithSelection = async (email: string) => {
  const selection = pendingSelections[email];
  const projects = selection?.selectAll ? [] : Array.from(selection?.projects || []);

  // Sequential: approve first, then set projects
  await fetch('/admin/api/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  await fetch('/admin/api/update-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, projects }),
  });

  await fetchViewers();
  setPendingSelections(prev => {
    const { [email]: _, ...rest } = prev;
    return rest;
  });
};

const saveProjectChanges = async (email: string) => {
  const selection = pendingSelections[email];
  const projects = selection?.selectAll ? [] : Array.from(selection?.projects || []);

  await fetch('/admin/api/update-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, projects }),
  });

  await fetchViewers();
  setExpandedViewer(null);
  setPendingSelections(prev => {
    const { [email]: _, ...rest } = prev;
    return rest;
  });
};

const hasChanges = (email: string): boolean => {
  const selection = pendingSelections[email];
  if (!selection) return false;

  const viewer = approvedViewers.find(v => v.email === email);
  if (!viewer) return false;

  const currentIsAll = viewer.projects.length === 0;
  if (currentIsAll !== selection.selectAll) return true;

  if (selection.selectAll) return false;

  const currentSet = new Set(viewer.projects);
  if (currentSet.size !== selection.projects.size) return true;

  for (const id of selection.projects) {
    if (!currentSet.has(id)) return true;
  }
  return false;
};

const toggleExpanded = (email: string) => {
  if (expandedViewer === email) {
    // Collapsing - discard pending changes
    setExpandedViewer(null);
    setPendingSelections(prev => {
      const { [email]: _, ...rest } = prev;
      return rest;
    });
  } else {
    // Expanding - initialize with current values
    const viewer = approvedViewers.find(v => v.email === email);
    if (viewer) {
      setPendingSelections(prev => ({
        ...prev,
        [email]: {
          selectAll: viewer.projects.length === 0,
          projects: new Set(viewer.projects)
        }
      }));
    }
    setExpandedViewer(email);
  }
};

const getProjectTitle = (projectId: string): string => {
  const project = lockedProjects.find(p => p.id === projectId);
  if (!project) return projectId;
  return project.subtitle ? `${project.title} (${project.subtitle})` : project.title;
};

const formatAccess = (projects: string[]): string => {
  if (projects.length === 0) return 'All projects';
  if (projects.length === 1) return getProjectTitle(projects[0]);
  return `${projects.length} projects`;
};
```

---

### 2. Edit Mode Cancellation Behavior

**Priority: HIGH**
**Location: Phase 5 - Approved Viewer Card section**

The plan does not specify what happens when:
- Admin expands a card, makes changes, then clicks another viewer's "Edit" button
- Admin expands a card, makes changes, then clicks "Revoke"
- Admin expands a card and wants to cancel without saving

**MUST ADD TO PLAN:**

> **Edit Mode Cancellation Behavior:**
> - Clicking "Edit ▼" on another viewer: Collapse current card, discard unsaved changes, expand new card
> - Clicking "Revoke" while expanded: Show confirmation, if confirmed revoke proceeds (discards unsaved changes)
> - No explicit Cancel button needed: Clicking "Edit ▲" (collapse) discards unsaved changes
> - This matches the modal behavior where clicking outside discards changes

**Implementation note:** The `toggleExpanded` function above handles this by clearing `pendingSelections` when collapsing.

---

### 3. Approve Button Validation State

**Priority: MEDIUM**
**Location: Phase 5 - Pending Viewer Card JSX**

The plan shows a warning message when nothing is selected but does not disable the Approve button.

**MUST UPDATE in plan's Pending Viewer Card JSX:**

```tsx
<button
  onClick={() => handleApproveWithSelection(viewer.email)}
  disabled={
    actionLoading === viewer.email ||
    (!pendingSelections[viewer.email]?.selectAll &&
     pendingSelections[viewer.email]?.projects.size === 0)
  }
  className="bg-green-600 ... disabled:opacity-50 disabled:cursor-not-allowed"
>
  Approve
</button>
```

---

### 4. Loading State Tracking

**Priority: MEDIUM**
**Location: Phase 4 & 5 - State definitions**

Plan mentions `lockLoading` for project toggles but doesn't show how to track loading state for viewer approve/save operations.

**MUST ADD TO PLAN - State definition:**

```typescript
// Existing in plan:
const [lockLoading, setLockLoading] = useState<string | null>(null);

// MUST ADD - for viewer operations:
const [actionLoading, setActionLoading] = useState<string | null>(null);
```

**Update `handleApproveWithSelection` and `saveProjectChanges` to wrap with:**

```typescript
setActionLoading(email);
try {
  // ... API calls
} finally {
  setActionLoading(null);
}
```

---

## CLARIFICATION Required

### 5. Humanics Projects Lock Status

**Priority: HIGH - Needs Product Decision**

During review, I discovered a potential inconsistency in [src/data/projects.ts](../../src/data/projects.ts):

| Project | `confidential` | `locked` | Current Behavior |
|---------|----------------|----------|------------------|
| humanics-calendar-sharing | `true` | **not set** | Publicly viewable |
| humanics-swap-withdraw | `true` | **not set** | Publicly viewable |
| jarvis | not set | **not set** | Publicly viewable |
| roblox-nux | `true` | `true` | Requires auth |
| xcode-touch-bar | `true` | `true` | Requires auth |

**Question:** Should humanics projects also be locked? The `confidential: true` flag currently only affects display (shows confidential notice), not access control.

**Options:**
1. **Keep current state** - Only roblox-nux and xcode-touch-bar require auth
2. **Lock humanics projects** - Add `locked: true` to humanics-calendar-sharing and humanics-swap-withdraw
3. **Lock all confidential** - Make `confidential: true` imply `locked: true` (code change)

**PLAN UPDATE NEEDED:** Add a note in Prerequisites section clarifying current locked projects and asking builder to confirm with stakeholder if needed.

---

## SUGGESTED Improvements (Optional)

### 6. Shared Access Check Utility

**Priority: LOW**
**Improves: Code maintainability**

Current code duplicates expiration checks in both [ProjectGrid.tsx](../../src/components/ProjectGrid.tsx) and [projects/[id]/page.tsx](../../src/app/projects/[id]/page.tsx).

**SUGGESTED addition to `src/lib/auth/projects.ts`:**

```typescript
/**
 * Check if a viewer has access to a specific project
 * Consolidates expiration + project-specific checks
 */
export function hasAccessToProject(
  viewer: ViewerAccess | null,
  projectId: string
): boolean {
  if (!viewer) return false;
  if (viewer.status !== 'approved') return false;
  if (viewer.expiresAt && viewer.expiresAt < Date.now()) return false;
  if (viewer.projects.length === 0) return true; // All projects
  return viewer.projects.includes(projectId);
}
```

**Impact:** Reduces duplication, single source of truth for access logic.

---

### 7. Tooltip for Multi-Project Access Display

**Priority: LOW**
**Improves: UX for viewers with access to many projects**

Current plan shows `"N projects"` for 2+ projects. Consider adding hover tooltip.

**SUGGESTED update to `formatAccess` display:**

```tsx
{viewer.projects.length > 1 ? (
  <span title={viewer.projects.map(getProjectTitle).join(', ')}>
    {formatAccess(viewer.projects)}
  </span>
) : (
  <span>{formatAccess(viewer.projects)}</span>
)}
```

---

## File Change Validation

### Phase 1: Core Helpers ✅

| File | Change | Validation |
|------|--------|------------|
| `src/lib/auth/projects.ts` | CREATE | Pattern matches existing modules |
| `src/lib/auth/types.ts` | ADD `ProjectWithStatus` | Additive, no breaking changes |
| `src/lib/auth/index.ts` | ADD exports | Additive, no breaking changes |

### Phase 2: API Endpoints ✅

| File | Change | Validation |
|------|--------|------------|
| `src/app/admin/api/toggle-lock/route.ts` | CREATE | Follows existing admin API pattern |
| `src/app/admin/api/projects/route.ts` | CREATE | Follows existing admin API pattern |
| `src/app/admin/api/locked-projects/route.ts` | MODIFY | Replace static filter with dynamic |
| `src/app/admin/api/update-access/route.ts` | MODIFY | Replace static filter with dynamic |

### Phase 3: Access Control ✅

| File | Change | Validation |
|------|--------|------------|
| `src/components/ProjectGrid.tsx` | MODIFY | `project.locked` → `await isProjectLocked()` (Server Component, safe) |
| `src/app/projects/[id]/page.tsx` | MODIFY | `project.locked` → `await isProjectLocked()` (Server Component, safe) |

### Phase 4 & 5: Admin Dashboard ⚠️

| File | Change | Validation |
|------|--------|------------|
| `src/app/admin/AdminDashboard.tsx` | MODIFY | Needs helper function implementations (see #1) |
| `src/components/InlineProjectSelector.tsx` | CREATE | Component design is complete |
| `src/components/ProjectSelectionModal.tsx` | DELETE | Verify no other imports first |

---

## Pre-Implementation Checklist

Before builder starts:

- [ ] Planner adds missing helper function implementations to plan
- [ ] Planner adds edit mode cancellation behavior documentation
- [ ] Planner adds `actionLoading` state to plan
- [ ] Planner updates Approve button to be disabled when nothing selected
- [ ] Stakeholder confirms humanics projects lock status (or plan notes it's out of scope)

---

## Testing Validation

The plan's testing checklist is comprehensive. No additions needed.

**Recommended test order:**
1. Phase 1-2: API-level tests via browser console
2. Phase 3: Incognito window access control tests
3. Phase 4: Toggle switch visual + functional tests
4. Phase 5: Full inline selection flow tests
5. Final: `npx tsc --noEmit` + full regression

---

## Summary of Required Plan Updates

| # | Update | Priority | Section |
|---|--------|----------|---------|
| 1 | Add helper function implementations | **HIGH** | Phase 5 |
| 2 | Document edit mode cancellation behavior | **HIGH** | Phase 5 |
| 3 | Add `disabled` to Approve button | **MEDIUM** | Phase 5 JSX |
| 4 | Add `actionLoading` state | **MEDIUM** | Phase 4/5 state |
| 5 | Clarify humanics lock status question | **HIGH** | Prerequisites |

---

## Approval Decision

### Status: CONDITIONALLY APPROVED

The plan is **architecturally sound** and can proceed once the HIGH priority updates are addressed.

**After planner addresses items 1, 2, and 5:**
- Builder can proceed with Phases 1-4 immediately
- Phase 5 can proceed once items 3-4 are also addressed

**Success Criteria for Final Approval:**
1. All HIGH priority updates addressed in plan
2. `npx tsc --noEmit` passes after each phase
3. All testing checklist items verified
4. Modal component deleted with no orphan imports

---

*Review complete. Awaiting plan updates before final approval.*
