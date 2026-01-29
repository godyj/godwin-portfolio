# shadcn/ui Migration Implementation Plan

**Created:** 2026-01-25 22:59 PST
**Updated:** 2026-01-28 22:20 PST
**Author:** Planner
**Status:** ✅ COMPLETE - Migration and Verification Finished
**Review:** [SHADCN_UI_MIGRATION_REVIEW.md](../review/SHADCN_UI_MIGRATION_REVIEW.md)
**Target:** Migrate admin dashboard to shadcn/ui components
**Source:** [MIGRATION_CHECKLIST.md](../research/MIGRATION_CHECKLIST.md) (complete code samples)

---

## Overview

Migrate AdminDashboard.tsx (920 lines) and InlineProjectSelector.tsx (162 lines) from inline Tailwind CSS to shadcn/ui components using a walking skeleton approach.

**Constraints:**
- Tailwind v4 (config in globals.css via `@theme`, no tailwind.config.ts)
- React 19.2.3
- 46 existing tests must pass
- Dark mode via `prefers-color-scheme` preserved

---

## Phase 0: Walking Skeleton (Proof of Concept)

**Goal:** Prove shadcn/ui works with Tailwind v4 before full migration.

### Steps

1. **Install minimal deps:**
   ```bash
   npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot
   ```

2. **Create** `src/lib/utils.ts`:
   ```typescript
   import { type ClassValue, clsx } from "clsx"
   import { twMerge } from "tailwind-merge"
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

3. **Create** `src/components/ui/button.tsx` (copy from MIGRATION_CHECKLIST.md Section 2.1)

4. **Replace ONE button** - Logout button in AdminDashboard.tsx (~line 485):
   ```tsx
   <Button variant="ghost" onClick={handleLogout}>Logout</Button>
   ```

### Verification
- [ ] `npm run build` passes (check for React 19 forwardRef warnings - can be ignored if present)
- [ ] `npm run test:run` - 46 tests pass
- [ ] Logout button renders and works in light/dark mode
- [ ] Verify Radix Switch works with standard `fireEvent.click()` in tests

**Exit criteria:** All pass -> proceed. Build fails -> debug before continuing.

---

## Phase 1: Foundation Setup

### Steps

1. **Install remaining deps:**
   ```bash
   npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-collapsible @radix-ui/react-tooltip lucide-react tailwindcss-animate
   ```

2. **Create** `components.json` at project root (copy from MIGRATION_CHECKLIST.md Section 1.4)

3. **Add CSS variables** to `src/app/globals.css` (copy from MIGRATION_CHECKLIST.md Section 1.5)
   - Add after existing `:root` block
   - Add dark mode variables to existing `@media (prefers-color-scheme: dark)` block
   - HSL format: `--background: 0 0% 100%;` (no `hsl()` wrapper)

4. **Configure tailwindcss-animate** for Tailwind v4:

   **Rationale:** shadcn/ui components use animation utilities like `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`. These come from the `tailwindcss-animate` plugin. Manual keyframes only provide basic `.animate-in` class but miss zoom/slide effects needed for smooth AlertDialog and Select transitions.

   **For Tailwind v4**, add to `src/app/globals.css`:
   ```css
   @import "tailwindcss";
   @plugin "tailwindcss-animate";
   ```

   **Alternative (if plugin doesn't work with v4):** Strip animation classes from component code - dialogs will work but appear/disappear instantly without transitions. This is acceptable fallback.

### Verification
- [ ] `npm run build` passes
- [ ] `npm run test:run` - 46 tests pass

---

## Phase 2: Component Creation

Create all components in `src/components/ui/` (copy code from MIGRATION_CHECKLIST.md):

| Component | File | MIGRATION_CHECKLIST Section |
|-----------|------|----------------------------|
| Button | button.tsx | 2.1 (lines 177-234) |
| Badge | badge.tsx | 2.3 (lines 271-314) |
| Switch | switch.tsx | 2.2 (lines 236-269) |
| Input | input.tsx | 2.9 (lines 729-758) |
| Card | card.tsx | 2.4 (lines 316-399) |
| Skeleton | skeleton.tsx | 2.8 (lines 708-727) |
| Select | select.tsx | 2.5 (lines 401-555) |
| AlertDialog | alert-dialog.tsx | 2.6 (lines 557-689) |
| Collapsible | collapsible.tsx | 2.7 (lines 691-705) |
| Tooltip | tooltip.tsx | 2.11 (lines 798-832) |
| index.ts | index.ts | 2.10 (lines 760-795) |

### Verification
- [ ] `npm run build` passes
- [ ] `npm run test:run` - 46 tests pass

---

## Phase 3: AdminDashboard.tsx Migration

**File:** `src/app/admin/AdminDashboard.tsx`

### 3.1 Add Imports
```typescript
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

### 3.2 Replace Loading State (~line 493)
**Before:** `<div className="text-center py-20 text-stone-400">Loading...</div>`
**After:** Skeleton components (see MIGRATION_CHECKLIST.md Task 1)

### 3.3 Replace Status Badges
| Section | New Component |
|---------|--------------|
| Pending count | `<Badge variant="pending">{count}</Badge>` |
| Approved count | `<Badge variant="approved">{count}</Badge>` |
| Denied count | `<Badge variant="denied">{count}</Badge>` |
| Archived count | `<Badge variant="archived">{count}</Badge>` |
| Expiration warning | `<Badge variant="expiring">` |

### 3.4 Replace Project Lock Toggles (~line 523)
**Before:** Custom button with absolute positioning
**After:** `<Switch checked={project.locked} onCheckedChange={(checked) => handleToggleLock(project.id, checked)} />`

### 3.5 Replace Expiration Selects (~lines 595, 772)
**Before:** `<select>` with `onChange={(e) => ...e.target.value}`
**After:** `<Select onValueChange={(value) => ...}>` (see MIGRATION_CHECKLIST.md Task 4)

### 3.6 Replace Date Inputs (~lines 613, 790)
**Before:** `<input type="date" className="...">`
**After:** `<Input type="date" className="w-[180px]">`

### 3.7 Replace Action Buttons
| Button | shadcn Variant |
|--------|---------------|
| Deny | `<Button variant="destructive" size="sm">` |
| Approve | `<Button size="sm" className="bg-green-600 hover:bg-green-700">` |
| Edit/Archive/Restore | `<Button variant="ghost" size="sm">` |
| Revoke | `<Button variant="ghost" size="sm" className="text-red-600">` |

### 3.8 Replace Confirm Dialogs with AlertDialog
**Critical:** Remove `window.confirm()` from `handleRevoke` and `handleArchive` functions.

**UX Change (Approved):** With `window.confirm()`, the button showed "Revoking..." during the API call. With AlertDialog, the dialog closes immediately on action click and the action happens in background. This is simpler UX and acceptable since the action is fast.

Wrap Revoke/Archive buttons in AlertDialog:
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="sm">Revoke</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke access?</AlertDialogTitle>
      <AlertDialogDescription>...</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleRevoke(email)}>Revoke</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 3.9 Wrap Inline Editor with Collapsible (~line 749)

**Purpose:** Add smooth expand/collapse animation to the inline viewer editor.

**Before (instant show/hide):**
```tsx
{expandedViewer === viewer.email && (
  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
    <InlineProjectSelector ... />
    {/* Expiration editor */}
  </div>
)}
```

**After (animated):**
```tsx
<Collapsible open={expandedViewer === viewer.email}>
  <CollapsibleContent className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
    <InlineProjectSelector ... />
    {/* Expiration editor */}
  </CollapsibleContent>
</Collapsible>
```

**Note:** The Edit button already triggers `toggleExpanded(viewer.email)` which sets `expandedViewer` state. Collapsible uses the `open` prop to control visibility - no changes needed to the toggle logic.

### 3.10 Add Tooltips to Disabled Buttons

**Purpose:** Explain to users why certain buttons are disabled.

**Setup:** Wrap the entire AdminDashboard return in `<TooltipProvider>`:
```tsx
return (
  <TooltipProvider>
    {/* existing content */}
  </TooltipProvider>
)
```

**Approve Button (~line 641):**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span tabIndex={selectedProjects.length === 0 || !expirationOptions[viewer.email] ? 0 : -1}>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        disabled={selectedProjects.length === 0 || !expirationOptions[viewer.email]}
        onClick={() => handleApprove(viewer.email)}
      >
        Approve
      </Button>
    </span>
  </TooltipTrigger>
  {(selectedProjects.length === 0 || !expirationOptions[viewer.email]) && (
    <TooltipContent>
      {selectedProjects.length === 0
        ? "Select at least one project"
        : "Set an expiration option"}
    </TooltipContent>
  )}
</Tooltip>
```

**Save Button (~line 815):**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span tabIndex={!hasChanges(viewer.email) ? 0 : -1}>
      <Button
        disabled={!hasChanges(viewer.email) || actionLoading === viewer.email}
        onClick={() => handleSaveChanges(viewer.email)}
      >
        {actionLoading === viewer.email ? 'Saving...' : 'Save Changes'}
      </Button>
    </span>
  </TooltipTrigger>
  {!hasChanges(viewer.email) && (
    <TooltipContent>No changes to save</TooltipContent>
  )}
</Tooltip>
```

**Note:** The `<span>` wrapper is needed because Radix Tooltip requires a focusable element, but disabled buttons are not focusable.

### Verification After Phase 3
- [ ] `npm run build` passes
- [ ] `npm run test:run` - 46 tests pass
- [ ] Inline editor expands/collapses smoothly
- [ ] Tooltips appear on disabled Approve/Save buttons

---

## Phase 4: InlineProjectSelector.tsx Migration

**File:** `src/components/InlineProjectSelector.tsx`

### 4.1 Add Import
```typescript
import { Switch } from "@/components/ui/switch"
```

### 4.2 Replace Toggle Buttons
**Before:** Custom button with absolute span
**After:**
```tsx
<Switch
  checked={selectAll}
  onCheckedChange={handleSelectAllChange}
  disabled={disabled}
/>
```

### Verification
- [ ] `npm run build` passes
- [ ] `npm run test:run` - may fail until Phase 4.5 (test updates)

---

## Phase 4.5: Test Updates (CRITICAL)

**Goal:** Update test helpers and queries broken by Switch migration.

### 4.5.1 Update Toggle State Helpers

**File:** `src/components/InlineProjectSelector.test.tsx`

**Before (class-based detection):**
```typescript
const isToggleOn = (button: HTMLElement) => button.className.includes('bg-brand-yellow');
const isToggleOff = (button: HTMLElement) => button.className.includes('bg-stone-300');
```

**After (data-state attribute):**
```typescript
const isToggleOn = (element: HTMLElement) => element.getAttribute('data-state') === 'checked';
const isToggleOff = (element: HTMLElement) => element.getAttribute('data-state') === 'unchecked';
```

### 4.5.2 Update Role Queries

Radix Switch uses `role="switch"`, not `role="button"`.

**Before:**
```typescript
screen.getByRole('button', { name: /select all projects/i })
screen.getByRole('button', { name: /toggle access for jarvis/i })
```

**After:**
```typescript
screen.getByRole('switch', { name: /select all projects/i })
screen.getByRole('switch', { name: /toggle access for jarvis/i })
```

**All affected queries (12+ instances):**
- `getByRole('button', { name: /select all/i })` → `getByRole('switch', ...)`
- `getByRole('button', { name: /toggle access for/i })` → `getByRole('switch', ...)`
- Any `getAllByRole('button')` that targets toggle switches

### 4.5.3 Verify Click Handling

Radix Switch should work with standard `fireEvent.click()`. Verified during walking skeleton phase.

### Verification
- [ ] `npm run test:run` - 46 tests pass (required before proceeding)

---

## Phase 5: Final Verification

### Build & Tests
```bash
npm run build      # Must pass
npm run test:run   # 46 tests must pass
```

### Manual Testing Checklist

**Visual (Light + Dark mode):**
- [ ] Logout button
- [ ] All status badges (pending, approved, denied, archived, expiring)
- [ ] Project lock switches
- [ ] Expiration select dropdown
- [ ] Date inputs
- [ ] All action buttons
- [ ] Loading skeleton
- [ ] AlertDialog modals

**Functional:**
- [ ] Approve pending viewer (with project selection + expiration)
- [ ] Deny pending viewer
- [ ] Edit approved viewer (projects + expiration)
- [ ] Revoke via AlertDialog
- [ ] Archive via AlertDialog
- [ ] Restore archived viewer
- [ ] Toggle project locks

---

## Files Summary

### New Files (13)
| Path | Source |
|------|--------|
| src/lib/utils.ts | MIGRATION_CHECKLIST.md 1.2 |
| components.json | MIGRATION_CHECKLIST.md 1.4 |
| src/components/ui/button.tsx | MIGRATION_CHECKLIST.md 2.1 |
| src/components/ui/badge.tsx | MIGRATION_CHECKLIST.md 2.3 |
| src/components/ui/switch.tsx | MIGRATION_CHECKLIST.md 2.2 |
| src/components/ui/input.tsx | MIGRATION_CHECKLIST.md 2.9 |
| src/components/ui/card.tsx | MIGRATION_CHECKLIST.md 2.4 |
| src/components/ui/skeleton.tsx | MIGRATION_CHECKLIST.md 2.8 |
| src/components/ui/select.tsx | MIGRATION_CHECKLIST.md 2.5 |
| src/components/ui/alert-dialog.tsx | MIGRATION_CHECKLIST.md 2.6 |
| src/components/ui/collapsible.tsx | MIGRATION_CHECKLIST.md 2.7 |
| src/components/ui/tooltip.tsx | MIGRATION_CHECKLIST.md 2.11 |
| src/components/ui/index.ts | MIGRATION_CHECKLIST.md 2.10 |

### Modified Files (4)
| Path | Changes |
|------|---------|
| src/app/globals.css | Add shadcn CSS variables |
| src/app/admin/AdminDashboard.tsx | Replace all inline UI with components |
| src/components/InlineProjectSelector.tsx | Replace toggles with Switch |
| src/components/InlineProjectSelector.test.tsx | Update toggle state detection |

### Dependencies
```bash
npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-collapsible @radix-ui/react-tooltip lucide-react tailwindcss-animate
```

---

## Test Execution Strategy

Run tests after EACH phase to catch issues early:

| Phase | Test Command | Expected Result |
|-------|--------------|-----------------|
| Phase 0 | `npm run test:run` | 46 pass (no test changes yet) |
| Phase 1 | `npm run test:run` | 46 pass |
| Phase 2 | `npm run test:run` | 46 pass |
| Phase 3 | `npm run test:run` | 46 pass |
| Phase 4 | `npm run test:run` | May fail (toggle queries changed) |
| Phase 4.5 | `npm run test:run` | 46 pass (required before Phase 5) |
| Phase 5 | `npm run test:run` | 46 pass (final verification) |

---

## Troubleshooting

**CSS variables not applying:** Ensure HSL format uses spaces, no `hsl()` wrapper

**Switch colors wrong:** Update to use `data-[state=checked]:bg-primary`

**Tests fail after Switch migration:** Use `data-state` attribute instead of class checking (see Phase 4.5)

**Animations not working with tailwindcss-animate:**
- Verify plugin is imported: `@plugin "tailwindcss-animate";` in globals.css
- If Tailwind v4 doesn't support the plugin syntax, fallback: strip animation classes from AlertDialog/Select component code (dialogs work but no transitions)

---

## Reference Documents

- **Code samples:** [MIGRATION_CHECKLIST.md](../research/MIGRATION_CHECKLIST.md)
- **Current admin UI:** [AdminDashboard.tsx](../../src/app/admin/AdminDashboard.tsx)
- **Project selector:** [InlineProjectSelector.tsx](../../src/components/InlineProjectSelector.tsx)
- **Design tokens:** [globals.css](../../src/app/globals.css)
