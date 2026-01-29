'use client';

import * as React from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

interface IOSActionSheetProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IOSActionSheet({
  trigger,
  children,
  title,
  open,
  onOpenChange
}: IOSActionSheetProps) {
  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={onOpenChange}>
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

interface IOSActionSheetItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  className?: string;
}

export function IOSActionSheetItem({
  children,
  onClick,
  destructive,
  className
}: IOSActionSheetItemProps) {
  const handleClick = () => {
    // Haptic feedback on supported devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.();
  };

  return (
    <button
      className={cn(
        'ios-action-item',
        destructive && 'ios-action-item--destructive',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
