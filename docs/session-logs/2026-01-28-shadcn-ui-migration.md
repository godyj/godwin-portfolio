# Session Log: shadcn/ui Migration

**Date:** 2026-01-28
**Time:** ~15:00 - 18:07 PST
**Duration:** ~3 hours
**Status:** COMPLETE
**Focus:** Migrate admin dashboard from inline Tailwind to shadcn/ui components

---

## Session Overview

Migrated the admin dashboard and related components from custom inline Tailwind styles to shadcn/ui, a headless component library built on Radix UI primitives. This provides consistent, accessible, and maintainable UI components.

---

## What Was Done (WHAT)

### Phase 0: Walking Skeleton
- Installed core dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`
- Created `src/lib/utils.ts` with the `cn()` utility function
- Created first Button component following shadcn patterns
- Replaced logout button in AdminDashboard as proof of concept

### Phase 1: Foundation
- Installed Radix UI packages for each component type
- Added shadcn CSS variables to `globals.css` (light + dark mode HSL values)
- Configured `tailwindcss-animate` plugin for animations
- Created `components.json` configuration file

### Phase 2: Created UI Components (11 components)
Built out the full component library in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| Button | Primary actions, logout, admin controls |
| Badge | Status indicators (Pending, Active, Expired) |
| Switch | Toggle controls for project access |
| Select | Email selection dropdown |
| Input | Form inputs (extensible) |
| Card | Content containers |
| Skeleton | Loading states |
| AlertDialog | Confirmation dialogs (revoke, reject) |
| Collapsible | Expandable sections for viewers list |
| Tooltip | Hover hints on action buttons |
| index.ts | Barrel export for clean imports |

### Phase 3: AdminDashboard.tsx Migration (920 lines)
Major component overhaul:
- Replaced all custom buttons with `<Button>` variants
- Replaced status badges with `<Badge>` using proper variants
- Replaced `window.confirm()` calls with `<AlertDialog>` for better UX
- Added `<Collapsible>` for expandable viewer sections
- Added `<Tooltip>` on all icon-based action buttons
- Used `<Select>` for email filtering dropdown

### Phase 4: InlineProjectSelector.tsx Migration
- Replaced custom toggle buttons with Radix `<Switch>` component
- Applied brand color (`--color-brand-yellow`) for ON state
- Maintained disabled state styling for locked projects

### Phase 4.5: Test Updates
Critical test changes to support Radix component behavior:
- Changed `getByRole('button')` to `getByRole('switch')` for toggle elements
- Updated state detection from CSS class-based to `data-state` attribute
- Tests now query `data-state="checked"` instead of looking for CSS classes

### Phase 5: Final Verification
- TypeScript build: PASS
- Vitest tests: 46/46 passing
- Manual testing: Verified by user

---

## Why These Decisions (WHY)

### Walking Skeleton Approach
Proved the integration worked end-to-end before committing to full migration. The logout button replacement validated:
- Build system compatibility
- CSS variable integration
- Component import patterns

### Badge Uses `<span>` Not `<div>`
**Problem:** Badges were placed inside `<p>` tags for viewer status display.

**Issue:** `<div>` inside `<p>` causes React hydration errors (invalid HTML nesting).

**Solution:** Badge component uses `<span>` which is valid inline content within `<p>` elements.

### Switch Uses `bg-[var(--color-brand-yellow)]`
**Problem:** Switch ON state needed to match the brand yellow color.

**Issue:** Hardcoding `#F4E87C` would create a second source of truth.

**Solution:** Reference the CSS variable directly: `bg-[var(--color-brand-yellow)]`. This:
- Maintains single source of truth in `globals.css`
- Automatically updates if brand color changes
- Follows the project's design system pattern

### AlertDialog Replaces window.confirm()
**Problem:** Native `window.confirm()` dialogs are:
- Not styleable
- Inconsistent across browsers
- Accessibility concerns
- Poor mobile UX

**Solution:** AlertDialog provides:
- Consistent styling with the rest of the UI
- Proper focus management
- Keyboard navigation
- Screen reader announcements
- Cancel/Confirm with clear labeling

### Test Helper Changes for Radix Switch
**Problem:** Tests failed after Switch migration because they queried for `button` role.

**Why:** Radix Switch renders with `role="switch"` (ARIA switch pattern) instead of `role="button"`.

**State Detection:** Radix uses `data-state="checked"` and `data-state="unchecked"` attributes instead of CSS classes for toggle state. Tests updated to query these attributes.

---

## Files Created (13 new files)

### Core Utilities
- `src/lib/utils.ts` - `cn()` function for className merging

### UI Components
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/index.ts` - Barrel export

### Configuration
- `components.json` - shadcn/ui configuration

---

## Files Modified (4 files)

### `src/app/globals.css`
Added shadcn CSS variables for theming:
- HSL color values for both light and dark modes
- Integrated with existing design system variables
- Border radius, ring colors, chart colors

### `src/app/admin/AdminDashboard.tsx`
Complete component migration (920 lines):
- All buttons → `<Button>` with variants
- Status text → `<Badge>` with semantic variants
- Confirmation dialogs → `<AlertDialog>`
- Expandable sections → `<Collapsible>`
- Icon buttons → wrapped with `<Tooltip>`
- Email filter → `<Select>`

### `src/components/InlineProjectSelector.tsx`
- Custom toggle implementation → Radix `<Switch>`
- Brand color applied via CSS variable reference
- Disabled state styling maintained

### `src/components/InlineProjectSelector.test.tsx`
- Role queries updated: `button` → `switch`
- State detection updated: CSS classes → `data-state` attribute
- Added proper assertions for Radix component behavior

---

## Dependencies Added

### Core shadcn Dependencies
```json
"class-variance-authority": "^0.7.x"
"clsx": "^2.x"
"tailwind-merge": "^2.x"
```

### Radix UI Primitives
```json
"@radix-ui/react-slot": "^1.x"
"@radix-ui/react-dialog": "^1.x"
"@radix-ui/react-alert-dialog": "^1.x"
"@radix-ui/react-select": "^2.x"
"@radix-ui/react-switch": "^1.x"
"@radix-ui/react-collapsible": "^1.x"
"@radix-ui/react-tooltip": "^1.x"
```

### Utilities
```json
"lucide-react": "^0.x" (icons)
"tailwindcss-animate": "^1.x" (animation utilities)
```

---

## Issues Encountered & Solutions

### Issue 1: Hydration Error with Badge in `<p>` Tag
**Symptom:** React hydration mismatch error in console.

**Cause:** Badge component used `<div>` which is block-level, placed inside `<p>` (inline content only).

**Solution:** Changed Badge component from `<div>` to `<span>`.

### Issue 2: Switch ON State Not Showing Brand Color
**Symptom:** Switch appeared with default shadcn colors instead of project brand yellow.

**Cause:** Default shadcn Switch uses `bg-primary` which was mapped to a different color.

**Solution:** Applied `data-[state=checked]:bg-[var(--color-brand-yellow)]` to reference the design system variable.

### Issue 3: Tests Failing After Switch Migration
**Symptom:** 13 InlineProjectSelector tests failing with "Unable to find role button".

**Cause:**
1. Radix Switch uses `role="switch"` not `role="button"`
2. Toggle state is tracked via `data-state` attribute, not CSS classes

**Solution:**
1. Changed `getByRole('button')` to `getByRole('switch')`
2. Updated toggle state assertions to use `getAttribute('data-state')` instead of checking classList

---

## Verification Results

```bash
# TypeScript compilation
npx tsc --noEmit  # PASS

# Test suite
npm run test:run
# ✅ 46 tests passing (45 existing + 1 new/updated)

# Build
npm run build  # PASS

# Manual testing
# User verified all functionality works correctly
```

---

## Related Documentation

- [SHADCN_UI_MIGRATION_PLAN.md](../implementation/SHADCN_UI_MIGRATION_PLAN.md) - Original implementation plan
- [MIGRATION_CHECKLIST.md](../research/MIGRATION_CHECKLIST.md) - Phase-by-phase checklist
- [SHADCN_UI_MIGRATION_REVIEW.md](../review/SHADCN_UI_MIGRATION_REVIEW.md) - Technical review
- [COMMS.md](../../COMMS.md) - Session handoff document

---

## Component Usage Patterns (for future reference)

### Button Variants
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Danger Action</Button>
<Button variant="ghost" size="sm">Icon Button</Button>
```

### Badge Variants
```tsx
<Badge variant="warning">Pending</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Expired</Badge>
```

### Switch with Brand Color
```tsx
<Switch
  checked={isEnabled}
  onCheckedChange={handleChange}
  className="data-[state=checked]:bg-[var(--color-brand-yellow)]"
/>
```

### AlertDialog Pattern
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Next Steps (Optional Future Work)

1. **Apply shadcn to other pages** - Contact form, project pages
2. **Add more components** - Toast notifications, Tabs, Popover
3. **Theme customization** - Fine-tune color palette in CSS variables
4. **Dark mode refinement** - Ensure all components look good in dark theme

---

# Verification Session: 2026-01-28 Evening

**Time:** ~21:30 - 22:10 PST
**Duration:** ~40 minutes
**Status:** IN PROGRESS
**Focus:** Visual & functional verification of shadcn/ui migration

---

## Verification Progress

### Sections Verified ✅

| Section | Items | Status |
|---------|-------|--------|
| Project Settings | 5/5 | ✅ Complete |
| Viewer Cards - General | 3/3 | ✅ Complete |
| Pending Viewers | 5/5 | ✅ Complete |

### Sections Remaining

| Section | Items | Status |
|---------|-------|--------|
| Approved Viewers | 0/7 | ⬜ Not started |
| Denied Viewers | 0/2 | ⬜ Not started |
| Archived Viewers | 0/2 | ⬜ Not started |
| AlertDialog Confirmations | 0/5 | ⬜ Not started |
| Accessibility | 0/4 | ⬜ Not started |

---

## Bugs Found & Fixed During Verification

### Bug 1: Skeleton Loading Not Visible
**Symptom:** Loading state showed blank page instead of gray skeleton placeholders.

**Cause:** `bg-muted` class wasn't mapped in Tailwind v4's `@theme` block.

**Fix:** Added `--color-muted: hsl(var(--muted));` to `@theme inline` in globals.css.

### Bug 2: Toggle Couldn't Be Turned Off
**Symptom:** Once a project toggle was ON, clicking it wouldn't turn it OFF.

**Cause:** The `useEffect` dependency on `selectedProjects` triggered on every render because the array was created inline (new reference each time), resetting internal state.

**Fix:** Changed useEffect dependency to use `JSON.stringify(selectedProjects.slice().sort())` for stable comparison by content rather than reference.

### Bug 3: Approve Button Enabled When No Projects Selected
**Symptom:** The Approve button remained clickable even when all project toggles were OFF.

**Cause:** The `onChange` callback only passed the projects array. When empty, parent couldn't distinguish between "all projects" (intentional empty = grant all) vs "no selection" (user deselected everything = invalid).

**Fix:** Extended `onChange` signature to `(projects: string[], selectAll: boolean)`. Updated:
- `InlineProjectSelector.tsx` - passes selectAll flag
- `InlineProjectSelector.test.tsx` - updated expectations
- `AdminDashboard.tsx` - uses selectAll flag for button disable logic

### Bug 4: Missing Cursor Feedback on Buttons
**Symptom:** Hovering over buttons showed default cursor instead of pointer. Disabled buttons didn't show "not-allowed" cursor.

**Cause:** Button component had `disabled:pointer-events-none` which removed all cursor feedback.

**Fix:** Updated Button base styles to:
- Added `cursor-pointer` for enabled state
- Changed `disabled:pointer-events-none` to `disabled:cursor-not-allowed`

### Bug 5: Select Dropdown Transparent
**Symptom:** When opening the expiration dropdown, the menu background was transparent.

**Cause:** `bg-popover` class wasn't mapped in Tailwind v4's `@theme` block.

**Fix:** Added to `@theme inline` in globals.css:
- `--color-popover: hsl(var(--popover));`
- `--color-popover-foreground: hsl(var(--popover-foreground));`
- `--color-accent: hsl(var(--accent));`
- `--color-accent-foreground: hsl(var(--accent-foreground));`

### Bug 6: Select Component Missing Cursor Feedback
**Symptom:** Select trigger and items didn't show pointer cursor on hover.

**Fix:** Added `cursor-pointer` to:
- `SelectTrigger` component
- `SelectItem` component

---

## Files Modified During Verification

| File | Changes |
|------|---------|
| `src/app/globals.css` | Added muted, popover, accent color mappings to @theme |
| `src/components/InlineProjectSelector.tsx` | Fixed useEffect dependency, extended onChange signature |
| `src/components/InlineProjectSelector.test.tsx` | Updated tests for new onChange signature |
| `src/app/admin/AdminDashboard.tsx` | Updated onChange handler to use selectAll flag |
| `src/components/ui/button.tsx` | Added cursor-pointer, changed disabled cursor handling |
| `src/components/ui/select.tsx` | Added cursor-pointer to trigger and items |

---

## Test Results After Fixes

```bash
npm run test:run
# ✅ 46 tests passing
# ✅ Build passes
```

---

## Handoff Notes for Next Session

~~Continue verification from **Approved Viewers** section~~ - COMPLETED

---

# Verification Session: 2026-01-28 Final

**Time:** ~22:10 - 22:20 PST
**Duration:** ~10 minutes
**Status:** COMPLETE
**Focus:** Complete remaining verification checklist and bug fixes

---

## Verification Completed

### All Sections Verified ✅

| Section | Items | Status |
|---------|-------|--------|
| Project Settings | 5/5 | ✅ Complete |
| Viewer Cards - General | 3/3 | ✅ Complete |
| Pending Viewers | 5/5 | ✅ Complete |
| Approved Viewers | 7/7 | ✅ Complete |
| Denied Viewers | 2/2 | ✅ Complete |
| Archived Viewers | 2/2 | ✅ Complete |
| AlertDialog Confirmations | 5/5 | ✅ Complete |
| Accessibility | 4/4 | ✅ Complete |

### Approved Viewers - Verified Items
- Edit button - opens inline editor (Collapsible)
- Inline editor - smooth expand/collapse animation
- Expiration dropdown - Select component works
- Custom date input - Input appears when "Custom" selected
- Expiration badge - shows countdown
- Revoke button - AlertDialog confirmation
- Archive button - AlertDialog confirmation

### Denied Viewers - Verified Items
- Archive button - AlertDialog confirmation
- Approve button - now has inline project selector (see Bug 7 below)

### Archived Viewers - Verified Items
- Badge styling correct
- Restore button works

### AlertDialog Confirmations - Verified
- Escape key to close: ✅ Works
- Click outside behavior: Does NOT close (by design - see note below)
- All confirmation dialogs use AlertDialog pattern

### Accessibility - Verified
- Switch components have correct ARIA roles (`role="switch"`)
- Keyboard navigation works (Tab, Enter, Space)
- Focus indicators visible

---

## Bugs Found & Fixed During Verification

### Bug 7: Denied Viewers Approve Without Project Selection
**Symptom:** Clicking "Approve" on a denied viewer immediately approved them without allowing project selection.

**Cause:** The Denied Viewers section only had a simple Approve button without the inline project selector that Pending Viewers have.

**Fix:** Added `<Collapsible>` with `<InlineProjectSelector>` to denied viewers, matching the Pending Viewers UX:
- Click "Approve" expands to show project selection
- User selects projects or "All Projects"
- Click "Confirm Approve" to complete the action

### Bug 8: Deny Button Missing Confirmation
**Symptom:** Clicking "Deny" on a pending viewer immediately denied them without confirmation.

**Cause:** The Deny action wasn't wrapped in an AlertDialog like other destructive actions.

**Fix:** Added `<AlertDialog>` confirmation for Deny action in Pending Viewers section, consistent with other destructive actions (Revoke, Archive).

---

## AlertDialog Behavior Note

**Click outside does NOT close AlertDialog** - This is intentional Radix UI behavior for confirmation dialogs. AlertDialog is designed for critical confirmations that require an explicit user action (Cancel or Confirm). This prevents accidental dismissal.

If "click outside to close" behavior is desired, use `Dialog` component instead. AlertDialog is correct for destructive confirmations.

---

## Files Modified During Verification

| File | Changes |
|------|---------|
| `src/app/admin/AdminDashboard.tsx` | Added denied viewers project selector with Collapsible, added Deny AlertDialog confirmation |
| `COMMS.md` | Updated with verification results and bug fixes |

---

## Final Test Results

```bash
npm run build
# ✅ Build passes

npm run test:run
# ✅ 46/46 tests passing
```

---

## Migration Status: COMPLETE

The shadcn/ui migration is now fully verified and complete:

- **11 UI components** created and integrated
- **46 tests** passing
- **Build** passing
- **All verification checklist items** confirmed
- **8 bugs** found and fixed during verification

The admin dashboard now uses a consistent, accessible component library built on Radix UI primitives.
