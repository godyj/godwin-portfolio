'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IOSContextMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IOSContextMenu({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange
}: IOSContextMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <AnimatePresence>
        {open && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content asChild sideOffset={8} align="end">
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

interface IOSMenuItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  onSelect?: () => void;
  destructive?: boolean;
  className?: string;
  asChild?: boolean;
}

export const IOSMenuItem = React.forwardRef<HTMLDivElement, IOSMenuItemProps>(
  ({ children, icon, onClick, onSelect, destructive, className, asChild }, ref) => {
    const handleSelect = () => {
      // Haptic feedback on supported devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      onSelect?.();
      onClick?.();
    };

    return (
      <DropdownMenu.Item
        ref={ref}
        asChild={asChild}
        className={cn(
          'ios-menu-item',
          destructive && 'ios-menu-item--destructive',
          className
        )}
        onSelect={handleSelect}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon && <span className="ios-menu-item-icon">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </DropdownMenu.Item>
    );
  }
);

IOSMenuItem.displayName = 'IOSMenuItem';

export function IOSMenuSeparator({ className }: { className?: string }) {
  return (
    <DropdownMenu.Separator className={cn('ios-menu-separator', className)} />
  );
}
