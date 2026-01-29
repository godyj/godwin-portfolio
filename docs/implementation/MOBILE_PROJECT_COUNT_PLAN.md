# Plan: Fix Mobile "X more below" Count

**Status:** ✅ Implemented

---

## Problem

The "X more below" indicator showed incorrect counts on mobile and had visibility issues:

1. **Wrong count on mobile** - Original logic assumed 2-column grid when checking "top row" visibility
2. **Indicator hidden prematurely** - Checking first card visibility caused indicator to hide when scrolled past first card
3. **Indicator visible on hero** - The `-mt-[42px]` made container peek into viewport while on hero

---

## Solution

Simplified the visibility calculation:

1. Check if projects container is meaningfully in viewport (top < 80% of viewport)
2. Count cards whose top is past 85% of viewport height as "below"
3. Remove complex per-card visibility percentage calculations

---

## Implementation

### File: `src/components/ProjectsSection.tsx`

**Final logic:**
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

## Files Changed

| File | Change |
|------|--------|
| `src/components/ProjectsSection.tsx` | Simplified hidden card calculation logic |

---

## Verification

1. `npm run dev`
2. Hero screen: Indicator should be hidden
3. Scroll to projects: Indicator appears with correct count
4. Mobile (<768px): Count updates correctly as you scroll
5. Desktop (>768px): Count updates correctly
6. Scroll to bottom: Indicator fades when all cards visible
