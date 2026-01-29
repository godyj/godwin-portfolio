# iOS-Style Menu Components for React/Next.js

Starter implementation for iOS-style contextual menus and action sheets using Vaul and Radix UI. Designed for a portfolio site with frosted glass aesthetics, smooth animations, and proper touch targets.

## Dependencies

```bash
npm install vaul @radix-ui/react-dropdown-menu framer-motion
```

---

## 1. iOS Action Sheet (Bottom Drawer)

Uses Vaul for the drawer mechanics with custom iOS styling.

### Component: `IOSActionSheet.tsx`

```tsx
'use client';

import { Drawer } from 'vaul';
import { ReactNode } from 'react';

interface ActionSheetProps {
  trigger: ReactNode;
  children: ReactNode;
  title?: string;
}

export function IOSActionSheet({ trigger, children, title }: ActionSheetProps) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="ios-overlay" />
        <Drawer.Content className="ios-drawer">
          <div className="ios-drawer-handle" />
          {title && <Drawer.Title className="ios-drawer-title">{title}</Drawer.Title>}
          <div className="ios-drawer-content">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface ActionSheetItemProps {
  children: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

export function IOSActionSheetItem({ children, onClick, destructive }: ActionSheetItemProps) {
  const handleClick = () => {
    // Haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.();
  };

  return (
    <button
      className={`ios-action-item ${destructive ? 'ios-action-item--destructive' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
```

---

## 2. iOS Context Menu (Dropdown)

Uses Radix Dropdown Menu with iOS styling.

### Component: `IOSContextMenu.tsx`

```tsx
'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useState } from 'react';

interface ContextMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function IOSContextMenu({ trigger, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <AnimatePresence>
        {open && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content asChild sideOffset={8} align="center">
              <motion.div
                className="ios-menu"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1], // iOS spring approximation
                }}
              >
                {children}
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}

interface MenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

export const IOSMenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ children, icon, onClick, destructive }, ref) => {
    const handleSelect = () => {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      onClick?.();
    };

    return (
      <DropdownMenu.Item
        ref={ref}
        className={`ios-menu-item ${destructive ? 'ios-menu-item--destructive' : ''}`}
        onSelect={handleSelect}
      >
        {icon && <span className="ios-menu-item-icon">{icon}</span>}
        <span>{children}</span>
      </DropdownMenu.Item>
    );
  }
);

IOSMenuItem.displayName = 'IOSMenuItem';

export function IOSMenuSeparator() {
  return <DropdownMenu.Separator className="ios-menu-separator" />;
}
```

---

## 3. Shared Styles

### File: `ios-menu.css`

```css
/* ============================================
   iOS Design Tokens
   ============================================ */
:root {
  --ios-blur: 20px;
  --ios-saturation: 180%;
  --ios-bg-light: rgba(255, 255, 255, 0.72);
  --ios-bg-dark: rgba(30, 30, 30, 0.72);
  --ios-border-radius: 14px;
  --ios-touch-target: 44px;
  --ios-text-primary: #000;
  --ios-text-secondary: #6e6e73;
  --ios-text-destructive: #ff3b30;
  --ios-separator: rgba(60, 60, 67, 0.12);
  --ios-hover: rgba(0, 0, 0, 0.04);
  --ios-active-scale: 0.97;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ios-bg-light: rgba(30, 30, 30, 0.72);
    --ios-text-primary: #fff;
    --ios-text-secondary: #8e8e93;
    --ios-separator: rgba(84, 84, 88, 0.36);
    --ios-hover: rgba(255, 255, 255, 0.08);
  }
}

/* ============================================
   Action Sheet (Drawer) Styles
   ============================================ */
.ios-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
}

.ios-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--ios-bg-light);
  backdrop-filter: blur(var(--ios-blur)) saturate(var(--ios-saturation));
  -webkit-backdrop-filter: blur(var(--ios-blur)) saturate(var(--ios-saturation));
  border-radius: var(--ios-border-radius) var(--ios-border-radius) 0 0;
  padding: 8px 8px calc(env(safe-area-inset-bottom) + 8px);
  max-height: 85vh;
  outline: none;
}

.ios-drawer-handle {
  width: 36px;
  height: 5px;
  background: rgba(60, 60, 67, 0.3);
  border-radius: 2.5px;
  margin: 8px auto 16px;
}

.ios-drawer-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--ios-text-secondary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}

.ios-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ios-action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--ios-touch-target);
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #007aff;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.ios-action-item:hover {
  background: var(--ios-hover);
}

.ios-action-item:active {
  transform: scale(var(--ios-active-scale));
  background: var(--ios-hover);
}

.ios-action-item--destructive {
  color: var(--ios-text-destructive);
}

/* ============================================
   Context Menu (Dropdown) Styles
   ============================================ */
.ios-menu {
  min-width: 250px;
  background: var(--ios-bg-light);
  backdrop-filter: blur(var(--ios-blur)) saturate(var(--ios-saturation));
  -webkit-backdrop-filter: blur(var(--ios-blur)) saturate(var(--ios-saturation));
  border-radius: var(--ios-border-radius);
  padding: 6px;
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.08),
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.ios-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--ios-touch-target);
  padding: 10px 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: var(--ios-text-primary);
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: transform 0.1s ease, background 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.ios-menu-item:hover,
.ios-menu-item:focus {
  background: var(--ios-hover);
}

.ios-menu-item:active {
  transform: scale(var(--ios-active-scale));
}

.ios-menu-item[data-highlighted] {
  background: var(--ios-hover);
}

.ios-menu-item--destructive {
  color: var(--ios-text-destructive);
}

.ios-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: inherit;
}

.ios-menu-separator {
  height: 1px;
  background: var(--ios-separator);
  margin: 6px 0;
}

/* ============================================
   Safari-Specific Fixes
   ============================================ */
@supports (-webkit-touch-callout: none) {
  .ios-drawer,
  .ios-menu {
    /* Fix for older Safari backdrop-filter */
    transform: translateZ(0);
  }
}
```

---

## 4. Usage Examples

### Action Sheet Example

```tsx
import { IOSActionSheet, IOSActionSheetItem } from '@/components/IOSActionSheet';
import { Share, Copy, Trash } from 'lucide-react'; // or your icon library

export function ShareButton() {
  return (
    <IOSActionSheet
      trigger={<button className="share-trigger">Share</button>}
      title="Share Project"
    >
      <IOSActionSheetItem onClick={() => console.log('share')}>
        Share via Link
      </IOSActionSheetItem>
      <IOSActionSheetItem onClick={() => console.log('copy')}>
        Copy to Clipboard
      </IOSActionSheetItem>
      <IOSActionSheetItem onClick={() => console.log('delete')} destructive>
        Delete
      </IOSActionSheetItem>
    </IOSActionSheet>
  );
}
```

### Context Menu Example

```tsx
import { IOSContextMenu, IOSMenuItem, IOSMenuSeparator } from '@/components/IOSContextMenu';
import { Eye, Download, Link, Trash } from 'lucide-react';

export function ProjectCard() {
  return (
    <IOSContextMenu
      trigger={
        <button className="more-button">
          <MoreIcon />
        </button>
      }
    >
      <IOSMenuItem icon={<Eye size={20} />} onClick={() => {}}>
        View Details
      </IOSMenuItem>
      <IOSMenuItem icon={<Download size={20} />} onClick={() => {}}>
        Download
      </IOSMenuItem>
      <IOSMenuItem icon={<Link size={20} />} onClick={() => {}}>
        Copy Link
      </IOSMenuItem>
      <IOSMenuSeparator />
      <IOSMenuItem icon={<Trash size={20} />} onClick={() => {}} destructive>
        Delete
      </IOSMenuItem>
    </IOSContextMenu>
  );
}
```

---

## 5. Implementation Notes

### Performance Considerations
- `backdrop-filter` can be expensive on older devices. Test on real iOS Safari.
- Use `will-change: transform` sparingly — only during active animations.
- The Vaul library handles scroll locking and body scaling automatically.

### Accessibility
- Radix handles keyboard navigation (arrow keys, Enter, Escape).
- Both components manage focus correctly.
- Add `aria-label` to triggers for screen readers.

### Mobile Safari Quirks
- `env(safe-area-inset-bottom)` handles the home indicator on notched iPhones.
- `-webkit-tap-highlight-color: transparent` removes the default tap highlight.
- `transform: translateZ(0)` forces GPU acceleration for backdrop-filter.

### Haptic Feedback
The `navigator.vibrate()` call provides subtle feedback on Android. iOS Safari doesn't support this API, but the visual scale animation compensates.

---

## File Structure

```
components/
├── ios-menu/
│   ├── IOSActionSheet.tsx
│   ├── IOSContextMenu.tsx
│   └── ios-menu.css
```

Import the CSS in your layout or global styles file.
