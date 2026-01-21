# Implementation Plan: Project Selection UI for Admin Approval Flow

**Created:** 2026-01-20 21:21 PST
**Author:** Claude (Expert Developer)
**Status:** ✅ COMPLETE (2026-01-20 23:20 PST)

---

## Current Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 0 - Walking Skeleton | ✅ Complete | 22:17 PST |
| 1 - Modal Component | ✅ Complete | 22:30 PST |
| 2 - API + Validation | ✅ Complete | 22:32 PST |
| 3 - Dashboard Integration | ✅ Complete | 22:35 PST |
| 3.5 - UX Bug Fix | ✅ Complete | 22:57 PST |
| 4 - Integration Testing | ✅ Complete | 23:20 PST |

**Feature complete. All tests passed. Ready for production.**

---

## Phase 3.5: UX Bug Fix (Added 2026-01-20 22:57 PST)

### Bug Discovered

When approving a viewer, the modal defaulted to "Select All" instead of the specific project the viewer requested access from.

### Root Cause

The request flow only stored `email` - not which project the viewer came from. The modal saw `currentProjects: []` and defaulted to "Select All".

### Solution

Added `requestedProject` field to track the project user requested access from:

**Files Modified (8):**

| File | Change |
|------|--------|
| `src/lib/auth/types.ts` | Added `requestedProject?: string` to ViewerAccess |
| `src/components/ProtectedProject.tsx` | Added `projectId` prop |
| `src/components/AccessRequestModal.tsx` | Added `projectId` prop, included in API request |
| `src/app/api/auth/request/route.ts` | Extract and store `requestedProject` |
| `src/app/projects/[id]/page.tsx` | Pass `projectId` to ProtectedProject |
| `src/app/resume/page.tsx` | Pass `projectId="resume"` to ProtectedProject |
| `src/components/ProjectSelectionModal.tsx` | Use `requestedProject` as default in approve mode |
| `src/app/admin/AdminDashboard.tsx` | Pass `requestedProject` to modal |

### Data Flow

```
User visits /projects/xcode-touch-bar
  → AccessRequestModal receives projectId="xcode-touch-bar"
  → API stores requestedProject: "xcode-touch-bar" in viewer record

Admin clicks "Approve"
  → Modal receives requestedProject from viewer record
  → Modal defaults to only that project checked (not "Select All")
```

### Why This Approach

| Alternative | Rejected Because |
|-------------|------------------|
| Default to first locked project | Doesn't reflect user intent |
| Default to empty selection | Poor UX - admin has to guess |
| Store in URL param | Security risk |
| **Track in viewer record** | **Chosen** - preserves intent, secure, minimal changes |

---

## Executive Summary

Add a checkbox-based project selection interface to the admin dashboard, allowing administrators to grant viewers access to specific locked projects rather than blanket access to all projects. This addresses a critical gap where the backend supports granular access control but the UI only allows binary approve/deny.

---

## Review Decisions (2026-01-20)

| Question | Decision |
|----------|----------|
| Modal vs inline? | **Modal** - proceed as planned |
| Combine endpoints? | **No** - keep separate |
| State management? | **useState** - sufficient |
| Select All behavior? | **`projects: []`** - grants future projects |
| Empty selection? | **Disallow** - keep Confirm disabled |
| Visual indicator? | **Contextual** with tooltips |
| Audit logging? | **After** - separate PR |
| Project ID validation? | **Yes** - required security fix |

---

## Problem Statement

### Current State
- Admin can only **Approve** or **Deny** viewers
- Approval grants access to **ALL locked projects** (`projects: []`)
- No UI to select specific projects during approval
- No UI to modify access after approval
- Backend API (`/admin/api/update-access`) exists but is unused

### Desired State
- Admin sees checkbox list of locked projects when approving
- Admin can grant access to specific projects or all projects
- Admin can modify existing viewer's project access
- Dashboard shows which projects each viewer can access

---

## Technical Analysis

### Existing Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `ViewerAccess.projects` field | ✅ Ready | Array of project IDs in Redis |
| `/admin/api/update-access` endpoint | ✅ Ready | POST endpoint exists, accepts `{email, projects[]}` |
| Project data with `locked` flag | ✅ Ready | `projects.ts` has locked projects identified |
| Admin dashboard UI | ⚠️ Needs Update | No project selection component |

### Locked Projects (Current)
```
xcode-touch-bar   → Apple Xcode (Touch Bar)
roblox-nux        → Roblox (NUX)
```

### Access Control Logic
```typescript
projects: []                    // Empty = ALL locked projects
projects: ['xcode-touch-bar']   // Specific = ONLY listed projects
```

---

## Implementation Plan

### Phase 0: Walking Skeleton Test (Backend Validation)

**Goal:** Verify the existing `/admin/api/update-access` endpoint works correctly before building UI.

#### Prerequisites

| Requirement | Details |
|-------------|---------|
| Dev server | `npm run dev` → runs at `http://localhost:3000` |
| Admin login | Go to `/` → enter `godwinjohnson@me.com` → click magic link from email inbox |
| Test viewer | `godyj@me.com` must be approved (if not, approve via `/admin` dashboard first) |
| Upstash Console | https://console.upstash.com → login → select project DB to view Redis data |
| Incognito window | For testing viewer access without admin session interference |

**Auth Flow Reminder:**
1. User enters email on home page or protected project page
2. System sends magic link email (15-min expiry)
3. User clicks link → session cookie created (7-day expiry)
4. Admin: full access | Viewer: access based on `projects` array

#### Step 1: Prepare Test Viewer
```bash
# 1. Start dev server
npm run dev

# 2. Login as admin (godwinjohnson@me.com) via magic link
# 3. Approve test viewer (godyj@me.com) if not already approved
```

#### Step 2: Check Current State in Redis
```bash
# Via Upstash Console or curl
# Check viewer's current projects array
curl -X POST "https://YOUR_UPSTASH_URL" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '["GET", "viewer:godyj@me.com"]'
```

Expected: `projects: []` (all access) or `projects: ['xcode-touch-bar']`

#### Step 3: Test Update-Access API
```bash
# From browser console (while logged in as admin at /admin):

// Test 1: Restrict to single project
fetch('/admin/api/update-access', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'godyj@me.com',
    projects: ['xcode-touch-bar']  // Only Xcode
  })
}).then(r => r.json()).then(console.log);

// Expected: { success: true, viewer: { projects: ['xcode-touch-bar'], ... } }
```

#### Step 4: Verify Access Control Works
```bash
# 1. Login as viewer (godyj@me.com) in incognito window
# 2. Navigate to /projects/xcode-touch-bar → Should show content ✓
# 3. Navigate to /projects/roblox-nux → Should show "Request Access" ✗
```

#### Step 5: Test Grant All Access
```javascript
// From admin browser console:
fetch('/admin/api/update-access', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'godyj@me.com',
    projects: []  // Empty = all projects
  })
}).then(r => r.json()).then(console.log);
```

#### Step 6: Verify All Access Works
```bash
# As viewer:
# Navigate to /projects/xcode-touch-bar → Should show content ✓
# Navigate to /projects/roblox-nux → Should show content ✓
```

#### Walking Skeleton Success Criteria
- [ ] API returns `{ success: true }` with updated viewer
- [ ] Redis shows correct `projects` array after update
- [ ] Viewer with `['xcode-touch-bar']` can access Xcode but NOT Roblox
- [ ] Viewer with `[]` can access ALL locked projects
- [ ] No session invalidation needed (access checked on page load)

#### Access Control Logic (Already Implemented)

**File:** `src/app/projects/[id]/page.tsx:48-69`

```typescript
async function checkAccess(projectId: string, isLocked: boolean): Promise<boolean> {
  if (!isLocked) return true;

  const session = await getSession();
  if (!session) return false;
  if (session.role === 'admin') return true;

  const viewer = await redis.get<ViewerAccess>(`viewer:${session.email}`);
  if (!viewer || viewer.status !== 'approved') return false;
  if (viewer.expiresAt && Date.now() > viewer.expiresAt) return false;

  // KEY LOGIC: Empty array = all access, specific array = specific access
  if (viewer.projects.length === 0) return true;
  return viewer.projects.includes(projectId);
}
```

**Confirmed:** Backend already correctly handles granular project access.

#### Potential Issues to Watch For
| Issue | Symptom | Fix |
|-------|---------|-----|
| 401 Unauthorized | Not logged in as admin | Login via magic link first |
| 404 Viewer not found | Viewer email typo or not approved | Check exact email in Redis |
| Session caching | Old access still works | Hard refresh or clear cookies |

---

### Phase 1: Project Selection Modal Component ✅ COMPLETE

**File:** `src/components/ProjectSelectionModal.tsx`

**Completed:** 2026-01-20 22:30 PST

**Files Modified:**
- `src/lib/auth/types.ts` - Added `LockedProject` type
- `src/components/ProjectSelectionModal.tsx` - Created modal component

Create a reusable modal component for project selection:

```typescript
interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProjects: string[]) => void;
  viewerEmail: string;
  currentProjects?: string[];  // For edit mode
  mode: 'approve' | 'edit';
}
```

**UI Elements:**
1. Modal overlay with dark backdrop
2. Title: "Grant Project Access" (approve) or "Edit Project Access" (edit)
3. Viewer email display
4. Checkbox list of locked projects:
   - [ ] Apple Xcode (Touch Bar) `xcode-touch-bar`
   - [ ] Roblox (NUX) `roblox-nux`
5. "Select All" / "Deselect All" toggle
6. Cancel and Confirm buttons

**Behavior:**
- Checkboxes pre-selected based on `currentProjects` (edit mode)
- "Select All" checked = `projects: []` (all access)
- Specific checkboxes = `projects: ['id1', 'id2']`
- Confirm disabled if no projects selected

### Phase 2: Fetch Locked Projects ✅ COMPLETE

**Completed:** 2026-01-20 22:32 PST

**Files Created/Modified:**
- `src/app/admin/api/locked-projects/route.ts` - Created endpoint
- `src/app/admin/api/update-access/route.ts` - Added validation

**File:** `src/app/admin/api/locked-projects/route.ts`

New API endpoint to return locked projects:

```typescript
// GET /admin/api/locked-projects
export async function GET() {
  const lockedProjects = projects
    .filter(p => p.locked)
    .map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle
    }));

  return Response.json({ projects: lockedProjects });
}
```

#### Project ID Validation (Security Fix)

**Security (per review):** Validate project IDs exist in `projects.ts` before updating Redis.

```typescript
// Add validation before updating - add after line 15 of update-access/route.ts
import { projects } from '@/data/projects';

const validIds = projects.filter(p => p.locked).map(p => p.id);
const invalidIds = requestedProjects.filter(id => !validIds.includes(id));
if (invalidIds.length > 0) {
  return NextResponse.json({
    error: 'Invalid project IDs',
    invalid: invalidIds
  }, { status: 400 });
}
```

**Suggested (per review):** Add viewer status check to `/admin/api/update-access` - reject if viewer is not approved.

### Phase 3: Update AdminDashboard ✅ COMPLETE

**Completed:** 2026-01-20 22:35 PST

**File Modified:** `src/app/admin/AdminDashboard.tsx`

**File:** `src/app/admin/AdminDashboard.tsx`

#### 3a. Add State Management
```typescript
const [showProjectModal, setShowProjectModal] = useState(false);
const [selectedViewer, setSelectedViewer] = useState<ViewerAccess | null>(null);
const [modalMode, setModalMode] = useState<'approve' | 'edit'>('approve');
const [lockedProjects, setLockedProjects] = useState<LockedProject[]>([]);
```

#### 3b. Replace Direct Approve Button
Current:
```tsx
<button onClick={() => handleApprove(viewer.email)}>Approve</button>
```

New:
```tsx
<button onClick={() => openApproveModal(viewer)}>Approve</button>
```

#### 3c. Add Edit Button for Approved Viewers
```tsx
{viewer.status === 'approved' && (
  <button onClick={() => openEditModal(viewer)}>Edit Access</button>
)}
```

#### 3d. Show Current Access in Viewer Card
```tsx
<div className="text-sm text-stone-500">
  {viewer.projects.length === 0
    ? "All projects"
    : `${viewer.projects.length} project(s): ${formatProjectNames(viewer.projects)}`}
</div>
```

### Phase 4: Wire Up Modal Actions

#### 4a. Approve Flow (New)
```typescript
const handleApproveWithProjects = async (selectedProjects: string[]) => {
  try {
    // 1. Call existing approve endpoint
    await fetch('/admin/api/approve', {
      method: 'POST',
      body: JSON.stringify({ email: selectedViewer.email })
    });

    // 2. Call update-access to set specific projects
    await fetch('/admin/api/update-access', {
      method: 'POST',
      body: JSON.stringify({
        email: selectedViewer.email,
        projects: selectedProjects
      })
    });

    // 3. Close modal and refresh list
    setShowProjectModal(false);
    fetchViewers();
  } catch (error) {
    console.error('Failed to set projects after approval');
    // Show user error toast
  }
};
```

#### 4b. Edit Flow (New)
```typescript
const handleEditProjects = async (selectedProjects: string[]) => {
  await fetch('/admin/api/update-access', {
    method: 'POST',
    body: JSON.stringify({
      email: selectedViewer.email,
      projects: selectedProjects
    })
  });

  setShowProjectModal(false);
  fetchViewers();
};
```

---

## File Changes Summary

| File | Change Type | Description | Status |
|------|-------------|-------------|--------|
| `src/components/ProjectSelectionModal.tsx` | **New** | Checkbox modal component | ✅ Done |
| `src/app/admin/api/locked-projects/route.ts` | **New** | API to fetch locked projects | ✅ Done |
| `src/app/admin/AdminDashboard.tsx` | **Modify** | Add modal trigger, state, display | ✅ Done |
| `src/app/admin/api/update-access/route.ts` | **Modify** | Add project ID validation | ✅ Done |
| `src/lib/auth/types.ts` | **Modify** | Add `LockedProject` type | ✅ Done |

---

## UI/UX Design

### Modal Layout (Figma-style spec)

```
┌─────────────────────────────────────────────────┐
│                                              ✕  │
│  Grant Project Access                           │
│                                                 │
│  Viewer: viewer@example.com                     │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Select which projects this viewer can   │   │
│  │ access:                                 │   │
│  │                                         │   │
│  │ ☑ Select All [?]                       │   │
│  │   (grants access to all projects)      │   │
│  │ ─────────────────────────────────────  │   │
│  │ ☐ Apple Xcode (Touch Bar)              │   │
│  │ ☐ Roblox (NUX)                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Note: Empty selection = no access              │
│                                                 │
│            [ Cancel ]    [ Confirm ]            │
└─────────────────────────────────────────────────┘
```

**Tooltip (per review):** "Select All" checkbox should display tooltip: "Grants access to all current and future locked projects"

### Dashboard Card Layout (After Implementation)

```
┌─────────────────────────────────────────────────┐
│  viewer@example.com                             │
│  Approved Jan 15, 2026 · Expires Jan 22, 2026   │
│  Access: Apple Xcode (Touch Bar), Roblox (NUX)  │
│                                                 │
│             [ Edit Access ]  [ Revoke ]         │
└─────────────────────────────────────────────────┘
```

**Tooltip (per review):** When showing "N projects", hovering should reveal full list in tooltip.

#### Visual Indicator Format (per review)

| Scenario | Display | Tooltip |
|----------|---------|---------|
| `projects: []` | "All projects" | None needed |
| 1 project | "Apple Xcode (Touch Bar)" | None needed |
| 2 projects | "2 projects" | "Apple Xcode (Touch Bar), Roblox (NUX)" |
| 3+ projects | "N projects" | Full comma-separated list |

---

## Edge Cases & Validation

| Scenario | Handling |
|----------|----------|
| No locked projects exist | Hide modal, direct approve (show info message) |
| Admin unchecks all projects | Disable confirm button, show warning |
| Viewer already has access to project X, admin removes it | Update Redis, existing session still valid until re-check |
| New project added to `locked` list | Appears in modal; existing "all access" viewers get it automatically |
| Admin approves then immediately edits | Works fine; approve creates record, edit updates `projects` |

---

## Security Considerations

1. **API Authentication**: Both new endpoints require admin session cookie
2. **Input Validation**: Validate project IDs exist in `projects.ts`
3. **Rate Limiting**: Inherit existing admin API rate limits
4. **Audit Trail**: Consider adding logging for access changes (future enhancement)

---

## Testing Checklist

### Manual Testing
- [ ] Approve new viewer with "Select All" → verify `projects: []` in Redis
- [ ] Approve new viewer with specific projects → verify array in Redis
- [ ] Edit existing viewer to add project → verify update
- [ ] Edit existing viewer to remove project → verify update
- [ ] Edit from "all projects" to specific → verify change
- [ ] Cancel modal → no changes made
- [ ] View approved viewer card → shows correct project list

### Edge Cases
- [ ] Approve when no locked projects exist → graceful handling
- [ ] Try to confirm with no projects selected → blocked
- [ ] Rapid approve + edit → no race conditions

---

## Estimated Effort

| Phase | Complexity | Description | Status |
|-------|------------|-------------|--------|
| **Phase 0: Walking Skeleton** | Low | Validate existing backend works | ✅ Done |
| Phase 1: Modal Component | Medium | Core UI work | ✅ Done |
| Phase 2: Locked Projects API | Low | Simple filter + validation | ✅ Done |
| Phase 3: Dashboard Updates | Medium | State management | ✅ Done |
| Phase 3.5: UX Bug Fix | Medium | Track requested project | ✅ Done |
| Phase 4: Integration Testing | Low | Full flow testing | ✅ Done |

**Final Status:** All phases complete. Feature shipped.

---

## Implementation Order

0. ✅ **Walking Skeleton Test** - Validate `/admin/api/update-access` works via browser console (2026-01-20 22:17 PST)
1. ✅ **Create `ProjectSelectionModal.tsx`** - Build the UI component in isolation (2026-01-20 22:30 PST)
2. ✅ **Create `/admin/api/locked-projects`** - Simple API endpoint + validation (2026-01-20 22:32 PST)
3. ✅ **Update `AdminDashboard.tsx`** - Integrate modal with existing flow (2026-01-20 22:35 PST)
3.5. ✅ **UX Bug Fix** - Track `requestedProject` through request chain (2026-01-20 22:57 PST)
4. ✅ **Integration Testing** - All manual tests passed (2026-01-20 23:20 PST)

---

## Future Refinements Identified

During testing, the following improvements were identified for future work:

| Refinement | Description |
|------------|-------------|
| Delete viewers | Admin ability to remove old viewers from list entirely |
| Approve from denied | Should show project selection modal instead of auto-approving |
| Inline approval UI | Consider inline checkboxes instead of modal for reduced clicks |
| Global lock/unlock | Admin UI to choose which projects are locked/unlocked globally |

These have been added to [TODO.md](../../TODO.md) under "Refinements (After Skeleton)".

---

## Future Enhancements (Out of Scope)

- Per-project expiration dates
- Audit logging for all access changes
- Bulk approve multiple viewers
- Project groups / categories
- Email notification when access is modified

---

## Appendix: Current Code References

### ViewerAccess Type
**File:** [src/lib/auth/types.ts](../../src/lib/auth/types.ts)
```typescript
export interface ViewerAccess {
  email: string;
  status: 'pending' | 'approved' | 'denied';
  projects: string[];
  expiresAt: number | null;
  createdAt: number;
  approvedAt?: number;
}
```

### Update Access Endpoint
**File:** [src/app/admin/api/update-access/route.ts](../../src/app/admin/api/update-access/route.ts)
```typescript
export async function POST(request: Request) {
  // Validates admin session
  // Updates viewer.projects array in Redis
}
```

### Locked Projects in Data
**File:** [src/data/projects.ts](../../src/data/projects.ts)
```typescript
{
  id: 'xcode-touch-bar',
  locked: true,
  // ...
},
{
  id: 'roblox-nux',
  locked: true,
  // ...
}
```
