'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

type UseDismissiblePanelOptions = {
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useDismissiblePanel({ disabled = false, onOpenChange }: UseDismissiblePanelOptions = {}) {
  const [open, setOpenState] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setOpenState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        onOpenChange?.(value);
        return value;
      });
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open || disabled) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, disabled, setOpen]);

  const triggerProps = {
    'aria-expanded': open,
    'aria-haspopup': 'listbox' as const,
    'aria-controls': open ? listboxId : undefined,
  };

  const panelProps = {
    id: listboxId,
    role: 'listbox' as const,
  };

  return { open, setOpen, rootRef, triggerProps, panelProps, listboxId };
}
