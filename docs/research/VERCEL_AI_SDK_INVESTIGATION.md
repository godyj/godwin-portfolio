# Vercel AI SDK + shadcn/ui Investigation

**Date:** January 25, 2026  
**Purpose:** Evaluate feasibility of adding a conversational UI to the portfolio admin dashboard, plus adopting shadcn/ui as the design system  
**Status:** Research Complete

---

## Executive Summary

The Vercel AI SDK is a mature, production-ready toolkit that would integrate seamlessly with the existing portfolio stack. The combination of AI SDK Core (for tool calling), AI SDK UI (for chat hooks), and AI Elements (for pre-built components) makes implementing a conversational admin interface highly feasible.

**Key Insight:** AI Elements is built on shadcn/ui. Adopting shadcn/ui as the portfolio's design system provides both the foundation for AI features AND a consistent component library for all UI.

**Updated Recommendation:** 
1. **Phase 1:** Adopt shadcn/ui as the design system (migrate existing admin components)
2. **Phase 2:** Add AI SDK + AI Elements for conversational UI

---

## shadcn/ui Overview

### What It Is

shadcn/ui is not a component library you install as a dependency. It's a collection of re-usable components that you copy into your project and own completely. Built on:

- **Radix UI** - Unstyled, accessible primitives
- **Tailwind CSS** - Styling (already in your stack)
- **TypeScript** - Full type safety
- **CSS Variables** - Theming support

### Why This Approach Works

| Traditional Libraries | shadcn/ui |
|-----------------------|-----------|
| Import from `node_modules` | Copy to `src/components/ui` |
| Limited customization | Full source code ownership |
| Version lock-in | No version dependencies |
| Bundle entire library | Only include what you use |
| Style overrides via hacks | Direct Tailwind edits |

### Available Components (40+)

**Form & Input:**
- Button, Input, Textarea, Checkbox, Radio, Switch
- Select, Combobox, DatePicker, Slider
- Form (react-hook-form + zod validation)

**Layout & Container:**
- Card, Dialog, Sheet, Drawer, Popover
- Tabs, Accordion, Collapsible
- Table, DataTable (with TanStack Table)

**Feedback:**
- Alert, AlertDialog, Toast, Sonner
- Progress, Skeleton, Badge
- Tooltip, HoverCard

**Navigation:**
- Dropdown Menu, Context Menu, Menubar
- Navigation Menu, Breadcrumb, Pagination
- Command (⌘K style search)

---

## Current Admin Dashboard Analysis

### Components to Migrate

Looking at `AdminDashboard.tsx`, here's what would map to shadcn/ui:

| Current Implementation | shadcn/ui Component |
|------------------------|---------------------|
| Custom `<button>` with Tailwind | `Button` (variants: default, destructive, outline, ghost) |
| Custom toggle switch | `Switch` |
| Custom `<select>` | `Select` |
| Custom date `<input>` | `DatePicker` (uses Calendar + Popover) |
| Section dividers | `Card` with `CardHeader`, `CardContent` |
| Confirm dialogs (`confirm()`) | `AlertDialog` |
| Loading states | `Skeleton` or spinner |
| Status badges | `Badge` (variants for pending/approved/denied) |
| Expandable sections | `Collapsible` or `Accordion` |

### Migration Effort Estimate

| Component | Instances | Effort |
|-----------|-----------|--------|
| Buttons | ~15 | Low |
| Switches | ~4 | Low |
| Selects | ~4 | Low |
| Confirm dialogs | ~3 | Medium |
| Section cards | ~5 | Low |
| Status badges | ~6 | Low |
| Date inputs | ~2 | Medium |

**Total estimate:** 3-4 hours for full admin dashboard migration

---

## shadcn/ui Setup

### Installation

```bash
# Initialize shadcn/ui (one-time setup)
npx shadcn@latest init

# You'll be prompted for:
# - Style: Default or New York
# - Base color: Slate, Gray, Zinc, Neutral, Stone
# - CSS variables: Yes (recommended)
# - tailwind.config location
# - components.json location
```

### Configuration (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Adding Components

```bash
# Add individual components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add switch
npx shadcn@latest add badge
npx shadcn@latest add alert-dialog
npx shadcn@latest add skeleton

# Or add multiple at once
npx shadcn@latest add button card dialog select switch badge alert-dialog skeleton
```

Components are installed to `src/components/ui/` and can be customized directly.

### Required Dependencies

shadcn/ui will add these as needed:

```json
{
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-select": "^2.x",
  "@radix-ui/react-switch": "^1.x",
  "@radix-ui/react-alert-dialog": "^1.x",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "lucide-react": "^0.x"
}
```

---

## Migration Example: Buttons

### Before (Current)

```tsx
<button
  onClick={() => handleDeny(viewer.email)}
  disabled={actionLoading === viewer.email}
  className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
>
  {actionLoading === viewer.email ? '...' : 'Deny'}
</button>
```

### After (shadcn/ui)

```tsx
import { Button } from "@/components/ui/button"

<Button
  variant="destructive"
  size="sm"
  onClick={() => handleDeny(viewer.email)}
  disabled={actionLoading === viewer.email}
>
  {actionLoading === viewer.email ? '...' : 'Deny'}
</Button>
```

### Button Variants Available

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

---

## Migration Example: Confirm Dialogs

### Before (Current)

```tsx
const handleRevoke = async (email: string) => {
  if (!confirm(`Revoke access for ${email}?`)) return;
  // ... action
};
```

### After (shadcn/ui AlertDialog)

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Revoke</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke access?</AlertDialogTitle>
      <AlertDialogDescription>
        This will log {email} out of all sessions immediately.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleRevoke(email)}>
        Revoke
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Migration Example: Status Badges

### Before (Current)

```tsx
<span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm px-2 py-0.5 rounded-full">
  {pendingViewers.length}
</span>
```

### After (shadcn/ui Badge)

```tsx
import { Badge } from "@/components/ui/badge"

// Add custom variants to badge.tsx for status colors
<Badge variant="pending">{pendingViewers.length}</Badge>
<Badge variant="approved">{approvedViewers.length}</Badge>
<Badge variant="denied">{deniedViewers.length}</Badge>
```

Custom variants in `components/ui/badge.tsx`:

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "text-foreground border",
        // Custom status variants
        pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
        approved: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
        denied: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
        archived: "bg-stone-100 dark:bg-stone-800 text-stone-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

## Theming & Dark Mode

### CSS Variables Approach

shadcn/ui uses CSS variables for theming, which works seamlessly with Tailwind's dark mode:

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --primary: 24 9.8% 10%;
    --primary-foreground: 60 9.1% 97.8%;
    /* ... more variables */
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 60 9.1% 97.8%;
    /* ... dark mode overrides */
  }
}
```

### Mapping to Portfolio Brand Colors

Your current brand colors can be integrated:

```css
:root {
  /* Map brand-yellow to primary or create custom */
  --brand-yellow: 45 93% 58%;
  --brand-brown-dark: 30 20% 20%;
}
```

---

## Updated Implementation Plan

### Phase 1: shadcn/ui Foundation (2-3 hours)

1. **Initialize shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```

2. **Add core components**
   ```bash
   npx shadcn@latest add button card badge switch select alert-dialog skeleton collapsible
   ```

3. **Create utility file** (`src/lib/utils.ts`)
   ```typescript
   import { type ClassValue, clsx } from "clsx"
   import { twMerge } from "tailwind-merge"

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

4. **Update globals.css** with CSS variables

### Phase 2: Admin Dashboard Migration (3-4 hours)

1. **Replace buttons** - All button instances → `<Button>`
2. **Replace switches** - Toggle switches → `<Switch>`
3. **Replace selects** - Dropdown selects → `<Select>`
4. **Replace confirm()** - Native confirms → `<AlertDialog>`
5. **Add Cards** - Section wrappers → `<Card>`
6. **Add Badges** - Status indicators → `<Badge>`
7. **Add Skeletons** - Loading states → `<Skeleton>`

### Phase 3: AI SDK + AI Elements (3-4 hours)

1. **Install AI SDK**
   ```bash
   npm install ai @ai-sdk/react @ai-sdk/openai
   ```

2. **Install AI Elements**
   ```bash
   npx ai-elements@latest add message conversation prompt-input response
   ```

3. **Create chat API route** (`/admin/api/chat`)

4. **Create AdminChat component** with sliding panel

5. **Wire up tools** to existing admin APIs

### Phase 4: Polish & Refinement (2-3 hours)

1. Fine-tune theming for brand consistency
2. Add remaining tools for bulk operations
3. Implement `needsApproval` for destructive actions
4. Add toast notifications for actions (using Sonner)

---

## File Structure After Migration

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── switch.tsx
│   │   ├── select.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── ai-elements/           # AI Elements components
│   │   ├── message.tsx
│   │   ├── conversation.tsx
│   │   ├── prompt-input.tsx
│   │   └── response.tsx
│   └── InlineProjectSelector.tsx
├── lib/
│   └── utils.ts               # cn() helper
├── app/
│   └── admin/
│       ├── AdminDashboard.tsx # Migrated to shadcn/ui
│       ├── AdminChat.tsx      # New chat component
│       ├── api/
│       │   ├── chat/
│       │   │   ├── route.ts   # AI chat endpoint
│       │   │   └── tools.ts   # Tool definitions
│       │   └── ... existing APIs
│       └── page.tsx
```

---

## Decision

**Recommendation: IMPLEMENT IN PHASES**

| Phase | Focus | Effort | Priority |
|-------|-------|--------|----------|
| 1 | shadcn/ui setup | 2-3 hrs | High |
| 2 | Admin migration | 3-4 hrs | High |
| 3 | AI SDK + Elements | 3-4 hrs | Medium |
| 4 | Polish | 2-3 hrs | Low |

**Total estimated effort:** 10-14 hours

### Rationale

1. **shadcn/ui first** - Establishes design foundation, improves current UI immediately
2. **Owned components** - No version lock-in, full customization control
3. **AI Elements compatibility** - Built on same foundation, seamless integration
4. **Progressive enhancement** - Each phase delivers standalone value
5. **Project is small** - Perfect time to adopt before complexity grows

### Next Steps

1. Confirm you want to proceed with Phase 1
2. Choose base color theme (recommend: Stone to match current palette)
3. I can generate a detailed migration checklist for AdminDashboard.tsx

---

## Resources

**shadcn/ui:**
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Themes](https://ui.shadcn.com/themes)
- [GitHub](https://github.com/shadcn-ui/ui)

**AI SDK:**
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [AI SDK UI - Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

**AI Elements:**
- [AI Elements GitHub](https://github.com/vercel/ai-elements)
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6)
