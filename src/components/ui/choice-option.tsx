'use client';

import { Check } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { fieldShell } from '@/lib/field-shell';

type ChoiceOptionProps = {
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  showCheck?: boolean;
  role?: 'radio' | 'option' | 'button';
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
};

/** Bordered tile for radio/card picks — matches TextInput shell, not lip buttons. */
export function ChoiceOption({
  selected = false,
  disabled = false,
  onSelect,
  children,
  className,
  showCheck = true,
  role = 'button',
  ...aria
}: ChoiceOptionProps) {
  return (
    <button
      type="button"
      role={role}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...aria}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 text-left text-sm font-semibold transition-all duration-120',
        fieldShell.base,
        fieldShell.focusRing,
        disabled && fieldShell.disabled,
        !disabled && selected && fieldShell.selected,
        !disabled && !selected && cn(fieldShell.default, fieldShell.hover, 'text-slate-800'),
        className
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {showCheck && selected ? <Check size={16} className="shrink-0 text-brand" strokeWidth={2.5} aria-hidden /> : null}
    </button>
  );
}
