'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ListOptionProps = {
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  role?: 'option' | 'button';
  'aria-selected'?: boolean;
};

/** Flat row inside dropdown panels — subtle hover/selected, no lip chrome. */
export function ListOption({
  selected = false,
  focused = false,
  disabled = false,
  onSelect,
  children,
  className,
  role = 'option',
  ...aria
}: ListOptionProps) {
  return (
    <button
      type="button"
      role={role}
      disabled={disabled}
      {...aria}
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-120',
        'focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:outline-none',
        disabled && 'cursor-not-allowed opacity-50',
        selected ? 'bg-canvas-cool text-slate-900' : 'text-slate-800 hover:bg-slate-50',
        focused && !selected && 'bg-slate-50 ring-1 ring-slate-200 ring-inset',
        className
      )}
    >
      {children}
    </button>
  );
}
