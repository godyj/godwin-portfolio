# shadcn/ui Migration Checklist

**Project:** godwin-portfolio  
**Target:** Migrate admin dashboard to shadcn/ui components  
**Prerequisites:** Next.js 16.1.1, React 19.2.3, Tailwind v4, TypeScript 5.x

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies

```bash
cd /Users/godwinjohnson/Development/godwin-portfolio

# Core dependencies for shadcn/ui
npm install class-variance-authority clsx tailwind-merge

# Radix UI primitives (will be used by components)
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-collapsible @radix-ui/react-tooltip

# Icons (shadcn/ui default)
npm install lucide-react
```

### 1.2 Create Utility File

**Create:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 1.3 Create Components Directory

```bash
mkdir -p src/components/ui
```

### 1.4 Create shadcn/ui Config

**Create:** `components.json` (project root)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Note:** Tailwind v4 doesn't use `tailwind.config.ts` - config is in `globals.css` via `@theme`. Leave `config` empty.

### 1.5 Add shadcn/ui CSS Variables to globals.css

**Add to `src/app/globals.css`** after existing `:root` block (before `@media (prefers-color-scheme: dark)`):

```css
/* =============================================================================
   SHADCN/UI CSS VARIABLES
   Maps to existing design tokens for consistency
   ============================================================================= */
:root {
  /* shadcn/ui required variables - mapped to existing tokens */
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  
  --card: 0 0% 100%;
  --card-foreground: 0 0% 9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 9%;
  
  --primary: 45 93% 48%;              /* brand-yellow */
  --primary-foreground: 20 27% 8%;    /* brand-brown-dark */
  
  --secondary: 30 6% 90%;             /* stone-200 */
  --secondary-foreground: 24 10% 10%; /* stone-900 */
  
  --muted: 30 6% 96%;                 /* stone-100 */
  --muted-foreground: 24 6% 45%;      /* stone-500 */
  
  --accent: 30 6% 96%;                /* stone-100 */
  --accent-foreground: 24 10% 10%;    /* stone-900 */
  
  --destructive: 0 84% 60%;           /* red-500 */
  --destructive-foreground: 0 0% 98%; /* white */
  
  --border: 30 6% 90%;                /* stone-200 */
  --input: 30 6% 90%;                 /* stone-200 */
  --ring: 45 93% 48%;                 /* brand-yellow */
  
  --radius: 0.5rem;
  
  /* Status colors for badges */
  --status-pending-bg: 48 96% 89%;
  --status-pending-fg: 32 95% 44%;
  --status-approved-bg: 142 76% 90%;
  --status-approved-fg: 142 72% 29%;
  --status-denied-bg: 0 93% 94%;
  --status-denied-fg: 0 72% 51%;
  --status-archived-bg: 30 6% 96%;
  --status-archived-fg: 24 6% 45%;
}
```

**Add to existing `@media (prefers-color-scheme: dark)` block:**

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* ... existing dark mode variables ... */
    
    /* shadcn/ui dark mode */
    --background: 20 27% 8%;            /* brand-brown */
    --foreground: 30 6% 96%;            /* stone-100 */
    
    --card: 20 40% 4%;                  /* brand-brown-dark */
    --card-foreground: 30 6% 96%;
    
    --popover: 20 40% 4%;
    --popover-foreground: 30 6% 96%;
    
    --primary: 45 93% 48%;              /* brand-yellow */
    --primary-foreground: 20 27% 8%;
    
    --secondary: 24 10% 16%;            /* stone-800 */
    --secondary-foreground: 30 6% 96%;
    
    --muted: 24 10% 16%;
    --muted-foreground: 24 6% 64%;      /* stone-400 */
    
    --accent: 24 10% 16%;
    --accent-foreground: 30 6% 96%;
    
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 24 10% 20%;               /* stone-700 */
    --input: 24 10% 20%;
    --ring: 45 93% 48%;
    
    /* Status colors dark mode */
    --status-pending-bg: 32 100% 20%;
    --status-pending-fg: 48 96% 70%;
    --status-approved-bg: 142 50% 15%;
    --status-approved-fg: 142 76% 70%;
    --status-denied-bg: 0 50% 20%;
    --status-denied-fg: 0 93% 70%;
    --status-archived-bg: 24 10% 16%;
    --status-archived-fg: 24 6% 64%;
  }
}
```

---

## Phase 2: Create UI Components

### 2.1 Button Component

**Create:** `src/components/ui/button.tsx`

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 2.2 Switch Component

**Create:** `src/components/ui/switch.tsx`

```typescript
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-stone-300 dark:data-[state=unchecked]:bg-stone-600",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

### 2.3 Badge Component

**Create:** `src/components/ui/badge.tsx`

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "text-foreground border",
        // Status variants matching current admin styles
        pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
        approved: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
        denied: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
        archived: "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300",
        expiring: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### 2.4 Card Component

**Create:** `src/components/ui/card.tsx`

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### 2.5 Select Component

**Create:** `src/components/ui/select.tsx`

```typescript
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

### 2.6 AlertDialog Component

**Create:** `src/components/ui/alert-dialog.tsx`

```typescript
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

### 2.7 Collapsible Component

**Create:** `src/components/ui/collapsible.tsx`

```typescript
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

### 2.8 Skeleton Component

**Create:** `src/components/ui/skeleton.tsx`

```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

### 2.9 Input Component

**Create:** `src/components/ui/input.tsx`

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### 2.10 Create Component Index

**Create:** `src/components/ui/index.ts`

```typescript
export { Button, buttonVariants } from "./button"
export { Badge, badgeVariants } from "./badge"
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card"
export { Switch } from "./switch"
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select"
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"
export { Skeleton } from "./skeleton"
export { Input } from "./input"
```

### 2.11 Tooltip Component

**Create:** `src/components/ui/tooltip.tsx`

```typescript
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

---

## Phase 3: AdminDashboard.tsx Migration

### Component Instance Inventory

| Component Type | Count | Line Numbers (approx) |
|----------------|-------|----------------------|
| Buttons (action) | 15 | 455, 461, 475, 501, 536, 545, 553, 582, 625, 641, 658, 683, 696, 716, 733 |
| Switches (toggle) | 5 | 367-376 (project locks), InlineProjectSelector |
| Select (dropdown) | 4 | 426-438, 490-502, 571-583, 605-617 |
| Date inputs | 4 | 443-452, 506-515, 587-596, 621-630 |
| Status badges | 6 | 324, 519, 647, 678, 709, 722 |
| Confirm dialogs | 2 | handleRevoke (line 236), handleArchive (line 265) |
| Section cards | 5 | Project Settings, Pending, Approved, Denied, Archived |

### 3.1 Add Imports

**At top of `AdminDashboard.tsx`, add:**

```typescript
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
```

### 3.2 Migration Tasks (In Order)

#### Task 1: Replace Loading State (Line ~318)

**Before:**
```tsx
{loading ? (
  <div className="text-center py-20 text-stone-400">Loading...</div>
) : (
```

**After:**
```tsx
{loading ? (
  <div className="space-y-4 py-8">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-48 w-full" />
  </div>
) : (
```

#### Task 2: Replace Status Badges

**Before (line ~324):**
```tsx
<span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm px-2 py-0.5 rounded-full">
  {pendingViewers.length}
</span>
```

**After:**
```tsx
<Badge variant="pending" className="ml-2">{pendingViewers.length}</Badge>
```

Apply same pattern to:
- Approved count badge → `<Badge variant="approved">`
- Denied count badge → `<Badge variant="denied">`
- Archived count badge → `<Badge variant="archived">`
- Expiration badges → `<Badge variant="expiring">` or `<Badge variant="denied">` for expired

#### Task 3: Replace Project Settings Toggle Switches (Lines ~355-380)

**Before:**
```tsx
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
```

**After:**
```tsx
<Switch
  checked={project.locked}
  onCheckedChange={(checked) => handleToggleLock(project.id, checked)}
  disabled={lockLoading === project.id}
/>
```

#### Task 4: Replace Expiration Selects (Lines ~426-438, etc.)

**Before:**
```tsx
<select
  value={pendingExpirations[viewer.email]?.option || 'none'}
  onChange={(e) => setPendingExpirations(prev => ({
    ...prev,
    [viewer.email]: {
      option: e.target.value as ExpirationOption,
      customDate: prev[viewer.email]?.customDate || ''
    }
  }))}
  className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
>
  <option value="none">No expiration</option>
  <option value="7days">7 days</option>
  <option value="30days">30 days</option>
  <option value="90days">90 days</option>
  <option value="custom">Custom date</option>
</select>
```

**After:**
```tsx
<Select
  value={pendingExpirations[viewer.email]?.option || 'none'}
  onValueChange={(value) => setPendingExpirations(prev => ({
    ...prev,
    [viewer.email]: {
      option: value as ExpirationOption,
      customDate: prev[viewer.email]?.customDate || ''
    }
  }))}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select expiration" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">No expiration</SelectItem>
    <SelectItem value="7days">7 days</SelectItem>
    <SelectItem value="30days">30 days</SelectItem>
    <SelectItem value="90days">90 days</SelectItem>
    <SelectItem value="custom">Custom date</SelectItem>
  </SelectContent>
</Select>
```

#### Task 5: Replace Date Inputs (Lines ~443-452, etc.)

**Before:**
```tsx
<input
  type="date"
  value={pendingExpirations[viewer.email]?.customDate || ''}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => setPendingExpirations(prev => ({
    ...prev,
    [viewer.email]: {
      ...prev[viewer.email],
      customDate: e.target.value
    }
  }))}
  className="px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
/>
```

**After:**
```tsx
<Input
  type="date"
  value={pendingExpirations[viewer.email]?.customDate || ''}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => setPendingExpirations(prev => ({
    ...prev,
    [viewer.email]: {
      ...prev[viewer.email],
      customDate: e.target.value
    }
  }))}
  className="w-[180px]"
/>
```

#### Task 6: Replace Action Buttons

**Deny Button (Before):**
```tsx
<button
  onClick={() => handleDeny(viewer.email)}
  disabled={actionLoading === viewer.email}
  className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
>
  {actionLoading === viewer.email ? '...' : 'Deny'}
</button>
```

**After:**
```tsx
<Button
  variant="destructive"
  size="sm"
  onClick={() => handleDeny(viewer.email)}
  disabled={actionLoading === viewer.email}
>
  {actionLoading === viewer.email ? '...' : 'Deny'}
</Button>
```

**Approve Button (Before):**
```tsx
<button
  onClick={() => handleApproveWithSelection(viewer.email)}
  disabled={...}
  className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
</button>
```

**After:**
```tsx
<Button
  size="sm"
  onClick={() => handleApproveWithSelection(viewer.email)}
  disabled={...}
  className="bg-green-600 hover:bg-green-700"
>
  {actionLoading === viewer.email ? 'Approving...' : 'Approve'}
</Button>
```

**Ghost/Link Buttons (Edit, Archive, Logout):**
```tsx
<Button variant="ghost" size="sm" onClick={...}>
  Edit
</Button>
```

#### Task 7: Replace Confirm Dialogs with AlertDialog

**handleRevoke - Before (line ~236):**
```tsx
const handleRevoke = async (email: string) => {
  if (!confirm(`Revoke access for ${email}? This will log them out of all sessions.`)) {
    return;
  }
  // ... rest of function
};
```

**After - Remove confirm() from function:**
```tsx
const handleRevoke = async (email: string) => {
  setActionLoading(email);
  // ... rest of function (no confirm)
};
```

**Replace button with AlertDialog trigger:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
      Revoke
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke access?</AlertDialogTitle>
      <AlertDialogDescription>
        This will revoke access for {viewer.email} and log them out of all sessions immediately.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => handleRevoke(viewer.email)}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {actionLoading === viewer.email ? 'Revoking...' : 'Revoke'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Apply same pattern to `handleArchive`.

#### Task 8: Migrate InlineProjectSelector.tsx

Replace the custom toggle buttons with Switch component. Same pattern as Task 3.

---

## Phase 4: Verification Checklist

### Build Verification
```bash
npm run build
```

### Visual Verification
- [ ] All buttons render correctly in light mode
- [ ] All buttons render correctly in dark mode
- [ ] Switches toggle properly and show correct state
- [ ] Selects open, display options, and close properly
- [ ] AlertDialogs animate in/out smoothly
- [ ] Badges display correct colors for each status
- [ ] Loading skeletons animate properly
- [ ] Focus rings appear on keyboard navigation

### Functional Verification
- [ ] Approve viewer flow works
- [ ] Deny viewer flow works
- [ ] Revoke viewer flow works (with new dialog)
- [ ] Archive viewer flow works (with new dialog)
- [ ] Project lock toggle works
- [ ] Expiration select and date picker work
- [ ] InlineProjectSelector works

---

## Troubleshooting

### Tailwind v4 Animation Classes

If animations don't work, add to `globals.css`:

```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}

.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-out {
  animation: fadeOut 0.2s ease-out;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### HSL Color Format

shadcn/ui uses HSL without the `hsl()` wrapper. Colors must be space-separated values:
- ✅ `--background: 0 0% 100%;`
- ❌ `--background: hsl(0, 0%, 100%);`

### React 19 Compatibility

All components use `React.forwardRef` which is compatible with React 19. No changes needed.

---

## Files Created/Modified Summary

### New Files
- `src/lib/utils.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/index.ts`
- `components.json`

### Modified Files
- `src/app/globals.css` (add CSS variables)
- `src/app/admin/AdminDashboard.tsx` (component migration)
- `src/components/InlineProjectSelector.tsx` (switch migration)

### Dependencies Added
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `@radix-ui/react-dialog`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-select`
- `@radix-ui/react-switch`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-tooltip`
- `lucide-react`
