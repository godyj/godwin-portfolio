# Implementation Plan: Admin Project Lock/Unlock UI + Inline Project Selection

**Created:** 2026-01-21
**Author:** Claude (Expert Developer)
**Status:** ✅ COMPLETE (All Steps 1-10 Done)
**Last Updated:** 2026-01-25 19:55 PST

**Related:** [PROJECT_SELECTION_UI_PLAN.md](./PROJECT_SELECTION_UI_PLAN.md) - Completed feature for granting viewers access to specific locked projects (used modal approach)

---

## Executive Summary

Two related admin dashboard improvements:

1. **Project Lock/Unlock UI** - Allow admins to dynamically lock/unlock projects instead of editing `projects.ts`
2. **Inline Project Selection** - Replace the `ProjectSelectionModal` with inline checkboxes for faster viewer management

Both refinements were identified during the Project Selection UI implementation (see [TODO.md](../../TODO.md)).

---

## Problem Statement

### Current State
- Projects are locked via static `locked: boolean` in `src/data/projects.ts`
- Only 2 projects currently locked: `roblox-nux`, `xcode-touch-bar`
- Changing lock status requires code edit + deployment
- No admin UI to toggle project visibility
- Viewer project access requires opening a modal (extra clicks)

### Desired State
- Admin dashboard shows all projects with current lock status
- Admin can toggle lock/unlock on any project
- Changes take effect immediately (no deployment needed)
- Existing access control logic continues working
- **Inline project selection** - checkboxes visible directly in viewer cards (no modal)

---

## Prerequisites for Builder

### Environment Setup

| Requirement | Command/Location |
|-------------|------------------|
| Dev server | `npm run dev` → http://localhost:3000 |
| Admin login | Go to `/` → enter `godwinjohnson@me.com` → click magic link from email |
| Test viewer | Use `godyj@me.com` or create new via incognito |
| Redis console | https://console.upstash.com → select project DB |
| TypeScript check | `npx tsc --noEmit` |

### Key Files to Read First

| File | Purpose |
|------|---------|
| `src/app/admin/AdminDashboard.tsx` | Current admin UI - you'll modify this |
| `src/components/ProjectSelectionModal.tsx` | Current modal - you'll replace this |
| `src/data/projects.ts` | Static project data with `locked` property |
| `src/lib/auth/redis.ts` | Redis client - pattern to follow |
| `src/app/admin/api/locked-projects/route.ts` | API pattern to follow |

### Current Locked Projects

> **Note (2026-01-25):** All 5 projects now have `locked: true` in `projects.ts`. This was updated after the initial planning phase.

```typescript
// In projects.ts, ALL have locked: true
'humanics-calendar-sharing'  // Humanics (Calendar Sharing)
'humanics-swap-withdraw'     // Humanics (Swap & Withdraw)
'roblox-nux'                 // Roblox (NUX)
'jarvis'                     // Jarvis (Connected Car App)
'xcode-touch-bar'            // Apple Xcode (Touch Bar)
```

---

## Technical Approach

### Storage: Redis Override with Static Fallback

**Redis Key:** `project-lock:{projectId}` → `boolean`

**Logic:**
```
isProjectLocked(projectId):
  1. Check Redis for project-lock:{projectId}
  2. If found → return Redis value
  3. If not found → return static value from projects.ts
```

**Why this approach:**
| Alternative | Rejected Because |
|-------------|------------------|
| Modify `projects.ts` at runtime | Not possible - static file |
| Redis as single source of truth | Requires data migration, no fallback |
| Database (PostgreSQL, etc.) | Overkill for 5 projects |
| **Redis override + static fallback** | **Chosen** - No migration, graceful degradation |

---

## Implementation Phases

### Phase 1: Core Helper Functions

**New File:** `src/lib/auth/projects.ts`

```typescript
import { redis } from './redis';
import { projects } from '@/data/projects';

/**
 * Check if a project is locked (Redis override → static fallback)
 */
export async function isProjectLocked(projectId: string): Promise<boolean> {
  const override = await redis.get<boolean>(`project-lock:${projectId}`);
  if (override !== null) return override;
  const project = projects.find(p => p.id === projectId);
  return project?.locked === true;
}

/**
 * Get all currently locked project IDs
 */
export async function getLockedProjectIds(): Promise<string[]> {
  const results = await Promise.all(
    projects.map(async (p) => ({ id: p.id, locked: await isProjectLocked(p.id) }))
  );
  return results.filter(r => r.locked).map(r => r.id);
}

/**
 * Set project lock state in Redis (admin only)
 */
export async function setProjectLockState(projectId: string, locked: boolean): Promise<void> {
  await redis.set(`project-lock:${projectId}`, locked);
}

/**
 * Check if a viewer has access to a specific project
 * Consolidates expiration + project-specific checks
 */
export function hasAccessToProject(
  viewer: { status: string; expiresAt?: number; projects: string[] } | null,
  projectId: string
): boolean {
  if (!viewer) return false;
  if (viewer.status !== 'approved') return false;
  if (viewer.expiresAt && viewer.expiresAt < Date.now()) return false;
  if (viewer.projects.length === 0) return true; // All projects
  return viewer.projects.includes(projectId);
}
```

**Modify:** `src/lib/auth/types.ts`
```typescript
export type ProjectWithStatus = {
  id: string;
  title: string;
  subtitle: string;
  locked: boolean;
};
```

**Modify:** `src/lib/auth/index.ts`
- Export `isProjectLocked`, `getLockedProjectIds`, `setProjectLockState`, `hasAccessToProject`
- Export `ProjectWithStatus` type

---

### Phase 2: API Endpoints

**New File:** `src/app/admin/api/toggle-lock/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projects } from '@/data/projects';
import { setProjectLockState, isProjectLocked } from '@/lib/auth/projects';

export async function POST(request: NextRequest) {
  // 1. Admin auth check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate
  const body = await request.json();
  const { projectId, locked } = body;

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 });
  }

  if (typeof locked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid locked value' }, { status: 400 });
  }

  // 3. Verify project exists
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // 4. Set lock state in Redis
  await setProjectLockState(projectId, locked);

  return NextResponse.json({ success: true, projectId, locked });
}
```

| Check | Response |
|-------|----------|
| No admin session | 401 Unauthorized |
| Invalid request body | 400 Invalid request |
| Project not in projects.ts | 404 Project not found |
| Success | 200 { success, projectId, locked } |

**New File:** `src/app/admin/api/projects/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projects } from '@/data/projects';
import { isProjectLocked } from '@/lib/auth/projects';

export async function GET() {
  // Admin auth check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return all projects with their computed lock status
  const projectsWithStatus = await Promise.all(
    projects.map(async (project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle || '',
      locked: await isProjectLocked(project.id),
    }))
  );

  return NextResponse.json({ projects: projectsWithStatus });
}
```

**Modify:** `src/app/admin/api/locked-projects/route.ts`

Replace static filtering with:
```typescript
const lockedIds = await getLockedProjectIds();
const lockedProjects = projects
  .filter(p => lockedIds.includes(p.id))
  .map(p => ({ id: p.id, title: p.title, subtitle: p.subtitle || '' }));
```

**Modify:** `src/app/admin/api/update-access/route.ts`

Replace:
```typescript
const validLockedProjectIds = allProjects
  .filter((project) => project.locked === true)
  .map((project) => project.id);
```

With:
```typescript
const validLockedProjectIds = await getLockedProjectIds();
```

---

### Phase 3: Update Access Control Logic

**Modify:** `src/components/ProjectGrid.tsx`

The grid needs to check lock status for each project. Since this is a Server Component, update to:
```typescript
// For each project, check dynamic lock status
const isLocked = await isProjectLocked(project.id);
```

**Modify:** `src/app/projects/[id]/page.tsx`

Replace:
```typescript
const hasAccess = await checkAccess(project.id, project.locked === true);
```

With:
```typescript
const isLocked = await isProjectLocked(project.id);
const hasAccess = await checkAccess(project.id, isLocked);
```

Also update the condition:
```typescript
if (isLocked && !hasAccess) {
  return <ProtectedProject ... />;
}
```

---

### Phase 4: Admin Dashboard UI

**Modify:** `src/app/admin/AdminDashboard.tsx`

Add new state:
```typescript
const [allProjects, setAllProjects] = useState<ProjectWithStatus[]>([]);
const [lockLoading, setLockLoading] = useState<string | null>(null);
```

Add new functions:
```typescript
const fetchAllProjects = async () => {
  const res = await fetch('/admin/api/projects');
  const data = await res.json();
  setAllProjects(data.projects);
};

const handleToggleLock = async (projectId: string, locked: boolean) => {
  setLockLoading(projectId);
  try {
    await fetch('/admin/api/toggle-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, locked }),
    });
    await fetchAllProjects();
    await fetchLockedProjects(); // Refresh for viewer modals
  } finally {
    setLockLoading(null);
  }
};
```

Add useEffect:
```typescript
useEffect(() => {
  fetchAllProjects();
}, []);
```

Add UI section after "Approved Viewers":

```tsx
{/* Project Settings */}
<section className="mb-12">
  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
    Project Settings
  </h2>
  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
    Control which projects require authentication to view.
  </p>

  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
    {allProjects.map((project) => (
      <div key={project.id} className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            {project.title}
            {project.subtitle && (
              <span className="text-stone-500 dark:text-stone-400 font-normal">
                {' '}({project.subtitle})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-500">
            {project.locked ? 'Locked' : 'Public'}
          </span>
          <button
            onClick={() => handleToggleLock(project.id, !project.locked)}
            disabled={lockLoading === project.id}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              project.locked
                ? 'bg-green-600'
                : 'bg-stone-300 dark:bg-stone-600'
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                project.locked ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    ))}
  </div>
</section>
```

---

### Phase 5: Inline Project Selection UI (Replaces Modal)

**Goal:** Replace `ProjectSelectionModal` with inline checkboxes in viewer cards for faster, more elegant UX.

#### Why Inline is Better

| Modal Approach | Inline Approach |
|----------------|-----------------|
| 3 clicks: Approve → Select → Confirm | 1-2 clicks: Check boxes → Approve |
| Context switch (modal overlay) | Stay in context (same view) |
| Can't see other viewers while editing | Full dashboard visible |
| Extra component to maintain | Simpler component tree |

#### UI Design: Pending Viewer Card (Expanded)

```
┌─────────────────────────────────────────────────────────────────────┐
│  viewer@example.com                                                  │
│  Requested Jan 21, 2026 · from Roblox (NUX)                         │
│                                                                      │
│  Grant access to:                                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ☑ All projects (includes future locked projects)               │ │
│  │ ─────────────────────────────────────────────────────────────  │ │
│  │ ☐ Apple Xcode (Touch Bar)                                      │ │
│  │ ☐ Roblox (NUX)                            ← pre-checked        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                                        [ Deny ]  [ Approve ]         │
└─────────────────────────────────────────────────────────────────────┘
```

#### UI Design: Approved Viewer Card (Collapsed + Expandable)

```
┌─────────────────────────────────────────────────────────────────────┐
│  viewer@example.com                              [ Edit ▼ ] [Revoke]│
│  Approved Jan 21, 2026 · Access: Roblox (NUX)                       │
└─────────────────────────────────────────────────────────────────────┘

Expanded (after clicking Edit ▼):
┌─────────────────────────────────────────────────────────────────────┐
│  viewer@example.com                              [ Edit ▲ ] [Revoke]│
│  Approved Jan 21, 2026                                              │
│                                                                      │
│  Access:                                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ☐ All projects                                                 │ │
│  │ ─────────────────────────────────────────────────────────────  │ │
│  │ ☑ Apple Xcode (Touch Bar)                                      │ │
│  │ ☑ Roblox (NUX)                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                    [ Save Changes ]  │
└─────────────────────────────────────────────────────────────────────┘
```

#### State Changes in AdminDashboard.tsx

**Remove:**
```typescript
const [showProjectModal, setShowProjectModal] = useState(false);
const [selectedViewer, setSelectedViewer] = useState<ViewerAccess | null>(null);
const [modalMode, setModalMode] = useState<'approve' | 'edit'>('approve');
```

**Add:**
```typescript
// Track which viewer cards are expanded for editing
const [expandedViewer, setExpandedViewer] = useState<string | null>(null);

// Track loading state for viewer operations (approve/save)
const [actionLoading, setActionLoading] = useState<string | null>(null);

// Track pending project selections per viewer (before save)
const [pendingSelections, setPendingSelections] = useState<Record<string, {
  selectAll: boolean;
  projects: Set<string>;
}>>({});
```

#### Helper Functions for AdminDashboard.tsx

```typescript
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
  setActionLoading(email);
  try {
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
  } finally {
    setActionLoading(null);
  }
};

const saveProjectChanges = async (email: string) => {
  setActionLoading(email);
  try {
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
  } finally {
    setActionLoading(null);
  }
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

**Tooltip Enhancement:** When displaying access for viewers with 2+ projects, wrap in a span with title attribute:

```tsx
{viewer.projects.length > 1 ? (
  <span title={viewer.projects.map(getProjectTitle).join(', ')}>
    {formatAccess(viewer.projects)}
  </span>
) : (
  <span>{formatAccess(viewer.projects)}</span>
)}
```

#### Edit Mode Cancellation Behavior

> **Important:** Collapsing a viewer card discards any unsaved changes. This matches modal behavior where clicking outside discards changes.

| Scenario | Behavior |
|----------|----------|
| Click "Edit ▼" on another viewer | Collapse current card, discard unsaved changes, expand new card |
| Click "Revoke" while expanded | Show confirmation, if confirmed revoke proceeds (discards unsaved changes) |
| Click "Edit ▲" (collapse) | Discard unsaved changes, collapse card |

The `toggleExpanded` function handles this by clearing `pendingSelections[email]` when collapsing.

#### Inline Checkbox Component (Full Implementation)

Create `src/components/InlineProjectSelector.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { LockedProject } from '@/lib/auth/types';

interface InlineProjectSelectorProps {
  lockedProjects: LockedProject[];
  selectedProjects: string[];  // Empty = all projects
  requestedProject?: string;   // Pre-check for pending viewers
  onChange: (projects: string[]) => void;
  disabled?: boolean;
}

export default function InlineProjectSelector({
  lockedProjects,
  selectedProjects,
  requestedProject,
  onChange,
  disabled = false
}: InlineProjectSelectorProps) {
  // Empty selectedProjects means "all projects"
  const isAllProjects = selectedProjects.length === 0 && !requestedProject;

  const [selectAll, setSelectAll] = useState(isAllProjects);
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (selectedProjects.length > 0) {
      return new Set(selectedProjects);
    }
    if (requestedProject) {
      return new Set([requestedProject]);
    }
    return new Set();
  });

  // Sync with parent when selectedProjects changes (for edit mode)
  useEffect(() => {
    if (selectedProjects.length === 0 && !requestedProject) {
      setSelectAll(true);
      setSelected(new Set());
    } else if (selectedProjects.length > 0) {
      setSelectAll(false);
      setSelected(new Set(selectedProjects));
    }
  }, [selectedProjects, requestedProject]);

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelected(new Set());
      onChange([]); // Empty = all projects
    }
  };

  const handleProjectChange = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelected(newSelected);
    setSelectAll(false);
    onChange(Array.from(newSelected));
  };

  return (
    <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-3 space-y-2">
      {/* Select All option */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAllChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-stone-300 text-brand-yellow focus:ring-brand-yellow"
        />
        <span className="text-sm text-stone-700 dark:text-stone-300">
          All projects
          <span className="text-stone-500 dark:text-stone-400 ml-1">
            (includes future locked projects)
          </span>
        </span>
      </label>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700 my-2" />

      {/* Individual projects */}
      {lockedProjects.map((project) => (
        <label key={project.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectAll || selected.has(project.id)}
            onChange={(e) => handleProjectChange(project.id, e.target.checked)}
            disabled={disabled || selectAll}
            className="w-4 h-4 rounded border-stone-300 text-brand-yellow focus:ring-brand-yellow disabled:opacity-50"
          />
          <span className={`text-sm ${selectAll ? 'text-stone-400' : 'text-stone-700 dark:text-stone-300'}`}>
            {project.title}
            {project.subtitle && (
              <span className="text-stone-500 dark:text-stone-400"> ({project.subtitle})</span>
            )}
          </span>
        </label>
      ))}

      {/* Warning if nothing selected */}
      {!selectAll && selected.size === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Select at least one project or "All projects"
        </p>
      )}
    </div>
  );
}
```

#### Updated Pending Viewer Card JSX

```tsx
{pendingViewers.map((viewer) => (
  <div key={viewer.email} className="p-4 border-b ...">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="font-medium">{viewer.email}</p>
        <p className="text-sm text-stone-500">
          Requested {formatDate(viewer.createdAt)}
          {viewer.requestedProject && (
            <span> · from {getProjectTitle(viewer.requestedProject)}</span>
          )}
        </p>
      </div>
    </div>

    {/* Inline project selection */}
    <div className="mb-4">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
        Grant access to:
      </p>
      <InlineProjectSelector
        lockedProjects={lockedProjects}
        selectedProjects={[]}
        requestedProject={viewer.requestedProject}
        onChange={(projects) => updatePendingSelection(viewer.email, projects)}
      />
    </div>

    {/* Action buttons */}
    <div className="flex justify-end gap-2">
      <button onClick={() => handleDeny(viewer.email)} className="...">
        Deny
      </button>
      <button
        onClick={() => handleApproveWithSelection(viewer.email)}
        disabled={
          actionLoading === viewer.email ||
          (!pendingSelections[viewer.email]?.selectAll &&
           (pendingSelections[viewer.email]?.projects.size ?? 0) === 0)
        }
        className="bg-green-600 ... disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
      </button>
    </div>
  </div>
))}
```

#### Updated Approved Viewer Card JSX

```tsx
{approvedViewers.map((viewer) => (
  <div key={viewer.email} className="p-4 border-b ...">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{viewer.email}</p>
        <p className="text-sm text-stone-500">
          Approved {formatDate(viewer.approvedAt)}
          {expandedViewer !== viewer.email && (
            <span> · Access: {formatAccess(viewer.projects)}</span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => toggleExpanded(viewer.email)}
          className="text-sm text-stone-600 ..."
        >
          Edit {expandedViewer === viewer.email ? '▲' : '▼'}
        </button>
        <button onClick={() => handleRevoke(viewer.email)} className="text-red-600 ...">
          Revoke
        </button>
      </div>
    </div>

    {/* Expandable inline editor */}
    {expandedViewer === viewer.email && (
      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          Access:
        </p>
        <InlineProjectSelector
          lockedProjects={lockedProjects}
          selectedProjects={viewer.projects}
          onChange={(projects) => updatePendingSelection(viewer.email, projects)}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={() => saveProjectChanges(viewer.email)}
            disabled={!hasChanges(viewer.email)}
            className="bg-brand-yellow text-black px-4 py-2 text-sm font-medium rounded disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    )}
  </div>
))}
```

#### Files Changed for Inline UI

| File | Action | Description |
|------|--------|-------------|
| `src/components/InlineProjectSelector.tsx` | **CREATE** | Reusable inline checkbox component |
| `src/components/ProjectSelectionModal.tsx` | **DELETE** | No longer needed |
| `src/app/admin/AdminDashboard.tsx` | MODIFY | Replace modal with inline selectors |

---

## File Changes Summary

### Project Locking Feature

| File | Action | Description |
|------|--------|-------------|
| `src/lib/auth/projects.ts` | **CREATE** | Core helpers: isProjectLocked, getLockedProjectIds, setProjectLockState |
| `src/lib/auth/types.ts` | MODIFY | Add ProjectWithStatus type |
| `src/lib/auth/index.ts` | MODIFY | Export new functions and type |
| `src/app/admin/api/toggle-lock/route.ts` | **CREATE** | POST endpoint for toggling lock |
| `src/app/admin/api/projects/route.ts` | **CREATE** | GET all projects with status |
| `src/app/admin/api/locked-projects/route.ts` | MODIFY | Use getLockedProjectIds() |
| `src/app/admin/api/update-access/route.ts` | MODIFY | Use getLockedProjectIds() for validation |
| `src/components/ProjectGrid.tsx` | MODIFY | Use isProjectLocked() |
| `src/app/projects/[id]/page.tsx` | MODIFY | Use isProjectLocked() |

### Inline Project Selection Feature

| File | Action | Description |
|------|--------|-------------|
| `src/components/InlineProjectSelector.tsx` | **CREATE** | Reusable inline checkbox component |
| `src/components/ProjectSelectionModal.tsx` | **DELETE** | Replaced by inline UI |
| `src/app/admin/AdminDashboard.tsx` | MODIFY | Add Project Settings + replace modal with inline selectors |

---

## UI Wireframes

### Project Settings Section (Toggle Switches)

```
┌─────────────────────────────────────────────────────────┐
│  Project Settings                                        │
│  Control which projects require authentication to view.  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Humanics (Calendar Sharing)          Public   [○ ] │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Humanics (Swap & Withdraw)           Public   [○ ] │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Roblox (NUX)                         Locked   [●━] │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Jarvis (Connected Car App)           Public   [○ ] │ │
│  ├───────────────���────────────────────────────────────┤ │
│  │ Apple Xcode (Touch Bar)              Locked   [●━] │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Legend: [○ ] = Off (Public)  [●━] = On (Locked)
```

### Pending Viewer Card (Inline Selection)

```
┌─────────────────────────────────────────────────────────┐
│  viewer@example.com                                      │
│  Requested Jan 21, 2026 · from Roblox (NUX)             │
│                                                          │
│  Grant access to:                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ☐ All projects (includes future locked projects)   │ │
│  │ ─────────────────────────────────────────────────  │ │
│  │ ☐ Apple Xcode (Touch Bar)                          │ │
│  │ ☑ Roblox (NUX)  ← auto-selected from request       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│                              [ Deny ]    [ Approve ]     │
└─────────────────────────────────────────────────────────┘
```

### Approved Viewer Card (Collapsed)

```
┌─────────────────────────────────────────────────────────┐
│  viewer@example.com                    [ Edit ▼ ] [Revoke]
│  Approved Jan 21, 2026 · Access: Roblox (NUX)           │
└─────────────────────────────────────────────────────────┘
```

### Approved Viewer Card (Expanded for Editing)

```
┌─────────────────────────────────────────────────────────┐
│  viewer@example.com                    [ Edit ▲ ] [Revoke]
│  Approved Jan 21, 2026                                   │
│                                                          │
│  Access:                                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ☐ All projects                                     │ │
│  │ ─────────────────────────────────────────────────  │ │
│  │ ☑ Apple Xcode (Touch Bar)                          │ │
│  │ ☑ Roblox (NUX)                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                        [ Save Changes ]  │
└─────────────────────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Unlock project that viewer has access to | No issue - project becomes public |
| Lock project viewer doesn't have access to | Existing access control shows ProtectedProject |
| Redis unavailable | Falls back to static defaults |
| Toggle same project rapidly | Last write wins (Redis atomic) |

---

## Testing Checklist

### Project Locking Tests
- [ ] Admin sees "Project Settings" section in dashboard
- [ ] Toggle switches reflect current lock status
- [ ] Toggling lock updates UI immediately
- [ ] Locked project shows lock badge on home grid
- [ ] Unlocked project is publicly viewable (no badge, no auth)
- [ ] InlineProjectSelector shows only currently locked projects
- [ ] After locking new project, it appears in inline selector
- [ ] After unlocking project, it disappears from inline selector
- [ ] Viewer with access to locked project can view content
- [ ] Viewer without access sees ProtectedProject UI

### Inline Project Selection Tests
- [ ] Pending viewer card shows inline checkboxes
- [ ] Requested project is pre-selected for pending viewers
- [ ] "All projects" checkbox works (mutual exclusivity with individual)
- [ ] Approve button works with inline selection
- [ ] Approved viewer card shows collapsed view with access summary
- [ ] Edit button expands card to show inline checkboxes
- [ ] Current projects are pre-selected when editing
- [ ] Save Changes button updates viewer access
- [ ] Edit button toggles expand/collapse state
- [ ] Modal component is no longer used (can be deleted)

### TypeScript
```bash
npx tsc --noEmit
```

### Dev Server
```bash
npm run dev
```

---

## Data Migration

**None required.**

The "Redis override with static fallback" approach means:
1. Deploy code changes
2. All projects use static `locked` values initially
3. Admin toggles create Redis entries as needed
4. No upfront data population required

---

## Security Considerations

1. **Admin-only access**: All endpoints check `session.role === 'admin'`
2. **Input validation**: Verify projectId exists in `projects.ts`
3. **No user-facing lock bypass**: Lock state checked server-side
4. **Existing rate limits**: Inherit from admin API pattern

---

## Appendix: Current Locked Projects

From `src/data/projects.ts`:

| Project ID | Title | Static `locked` |
|------------|-------|-----------------|
| humanics-calendar-sharing | Humanics (Calendar Sharing) | **true** |
| humanics-swap-withdraw | Humanics (Swap & Withdraw) | **true** |
| roblox-nux | Roblox (NUX) | **true** |
| jarvis | Jarvis (Connected Car App) | **true** |
| xcode-touch-bar | Apple Xcode (Touch Bar) | **true** |

---

## Implementation Sequence (Step-by-Step)

### Step 1: Create Core Helper (Phase 1) ✅ COMPLETE
```bash
# Create file
touch src/lib/auth/projects.ts
# Add the code from Phase 1 section
```
**Verify:** `npx tsc --noEmit` passes

### Step 2: Update Types and Exports (Phase 1) ✅ COMPLETE
1. Add `ProjectWithStatus` type to `src/lib/auth/types.ts`
2. Add exports to `src/lib/auth/index.ts`:
   ```typescript
   export { isProjectLocked, getLockedProjectIds, setProjectLockState } from './projects';
   export type { ProjectWithStatus } from './types';
   ```
**Verify:** `npx tsc --noEmit` passes

### Step 3: Create Toggle Lock API (Phase 2) ✅ COMPLETE
```bash
mkdir -p src/app/admin/api/toggle-lock
touch src/app/admin/api/toggle-lock/route.ts
# Add the code from Phase 2 section
```
**Verify:**
- `npx tsc --noEmit` passes
- Test in browser console while logged in as admin:
  ```javascript
  fetch('/admin/api/toggle-lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: 'jarvis', locked: true })
  }).then(r => r.json()).then(console.log);
  // Should return: { success: true, projectId: 'jarvis', locked: true }
  ```

### Step 4: Create Projects API (Phase 2) ✅ COMPLETE
```bash
mkdir -p src/app/admin/api/projects
touch src/app/admin/api/projects/route.ts
# Add the code from Phase 2 section
```
**Verify:**
- Test in browser console: `fetch('/admin/api/projects').then(r => r.json()).then(console.log);`
- Should return all 5 projects with `locked` status

### Step 5: Update Existing APIs (Phase 2) ✅ COMPLETE
1. Update `src/app/admin/api/locked-projects/route.ts` to use `getLockedProjectIds()`
2. Update `src/app/admin/api/update-access/route.ts` to use `getLockedProjectIds()`

**Verify:** `npx tsc --noEmit` passes

### Step 6: Update Access Control (Phase 3) ✅ COMPLETE
1. Update `src/components/ProjectGrid.tsx` to use `isProjectLocked()`
2. Update `src/app/projects/[id]/page.tsx` to use `isProjectLocked()`

**Verify:**
- `npx tsc --noEmit` passes
- Toggle Jarvis to locked via API
- Visit `/projects/jarvis` in incognito - should show access request

### Step 7: Create InlineProjectSelector (Phase 5) ✅ COMPLETE
```bash
touch src/components/InlineProjectSelector.tsx
# Add the full code from Phase 5 section
```
**Verify:** `npx tsc --noEmit` passes

### Step 8: Update AdminDashboard (Phase 4 + 5) ✅ COMPLETE
1. Add Project Settings section (Phase 4 code)
2. Replace modal with inline selectors (Phase 5 code)
3. Remove modal state and imports
4. Add new state for expanded viewers and pending selections

**Verify:**
- `npx tsc --noEmit` passes
- Admin dashboard shows Project Settings section
- Toggle switches work
- Pending viewers show inline checkboxes
- Approve works with inline selection
- Edit expands/collapses for approved viewers

### Step 9: Delete Modal Component ✅ COMPLETE
```bash
rm src/components/ProjectSelectionModal.tsx
```
**Verify:** `npx tsc --noEmit` passes (no import errors)

### Step 10: Full Integration Test ✅ COMPLETE
Run through testing checklist (see Testing Checklist section)

### All Steps Complete ✅

**Completed:** 2026-01-25 20:50 PST
**Verification:**
- TypeScript: `npx tsc --noEmit` passes
- Tests: 45 unit tests passing
- Modal deleted: `ProjectSelectionModal.tsx` removed

---

## Related Documents

- [PROJECT_SELECTION_UI_PLAN.md](./PROJECT_SELECTION_UI_PLAN.md) - Viewer project access selection (completed, used modal approach)
- [TODO.md](../../TODO.md) - Lists this as "Admin UI to choose which projects are locked globally"
- [COMMS.md](../../COMMS.md) - Project handoff document
