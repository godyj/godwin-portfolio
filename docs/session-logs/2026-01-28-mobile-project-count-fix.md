# Session Log: Mobile Project Count Fix

**Date:** 2026-01-28
**Duration:** ~20 minutes
**Status:** ✅ Complete

---

## Objective

Fix the "X more below" indicator to show correct counts on mobile and proper visibility timing.

---

## Problem Statement

The "X more below" indicator had three issues:

1. **Wrong count on mobile** - Logic assumed 2-column grid when checking "top row" visibility, but mobile uses 1-column
2. **"1 more below" not showing** - When scrolled to see 5 of 6 cards, indicator disappeared because first card was off-screen
3. **Indicator visible on hero** - The `-mt-[42px]` on projects section made it peek into viewport while on hero screen

---

## Solution

Simplified the `calculateHiddenCards` function in `ProjectsSection.tsx`:

### Before (Complex)
- Detected mobile breakpoint to determine cards per row
- Checked if top row cards were 40% visible
- Calculated visibility percentage for each card
- Required cards to be 90% hidden AND in bottom half of viewport

### After (Simple)
- Check if container top is past 80% of viewport (not just peeking)
- Count cards whose top is past 85% of viewport as "below"
- No breakpoint detection needed - works for any layout

---

## Implementation Details

### Changes to `src/components/ProjectsSection.tsx`

```typescript
// Check if we're meaningfully within the projects section (not just peeking)
const containerRect = containerRef.current.getBoundingClientRect();
const inProjectsSection = containerRect.bottom > 0 && containerRect.top < viewportHeight * 0.8;

if (!inProjectsSection) {
  setHiddenCount(0);
  return;
}

let hidden = 0;
cardsArray.forEach((card) => {
  const rect = card.getBoundingClientRect();
  // Card is "below" if its top is near the bottom of viewport or beyond
  if (rect.top > viewportHeight * 0.85) {
    hidden++;
  }
});
```

---

## Testing

Verified on mobile viewport:
- [x] Indicator hidden when on hero screen
- [x] Indicator appears when scrolling to projects section
- [x] Count updates correctly as scrolling (5 → 4 → 3 → 2 → 1 → hidden)
- [x] "1 more below" shows correctly
- [x] Indicator fades when all cards visible

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ProjectsSection.tsx` | Simplified hidden card calculation |
| `docs/implementation/MOBILE_PROJECT_COUNT_PLAN.md` | Implementation plan |

---

## Key Insights

- The original logic was over-engineered with breakpoint detection and visibility percentages
- Simple viewport position checks are sufficient and more reliable
- The 80%/85% thresholds account for the negative margin on the projects section
