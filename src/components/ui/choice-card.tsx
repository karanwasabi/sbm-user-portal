'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';

type ChoiceCardProps = {
  selected?: boolean;
  disabled?: boolean;
  accent?: string;
  accentInk?: string;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  role?: 'radio' | 'option' | 'button';
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
};

export function ChoiceCard({
  selected = false,
  disabled = false,
  accent = 'var(--sbm-brand)',
  accentInk = 'var(--sbm-brand-press)',
  onSelect,
  children,
  className,
  role = 'button',
  ...aria
}: ChoiceCardProps) {
  const [pressed, setPressed] = useState(false);
  const isPressed = pressed && !disabled;

  return (
    <button
      type="button"
      role={role}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...aria}
      onClick={onSelect}
      onPointerDown={() => {
        if (!disabled) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        'w-full cursor-pointer border-x-0 border-t-0 border-b-4 text-left transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      style={{
        borderBottomColor: disabled
          ? 'var(--sbm-slate-200)'
          : isPressed
            ? selected
              ? accent
              : 'var(--sbm-slate-200)'
            : selected
              ? accentInk
              : 'var(--sbm-slate-200)',
        backgroundColor: selected ? accent : 'white',
        color: selected ? 'white' : 'var(--sbm-slate-800)',
        transform: isPressed ? 'translateY(3px) scale(0.995)' : selected ? 'scale(1.01)' : undefined,
        boxShadow:
          selected && !isPressed ? `0 8px 20px -8px color-mix(in srgb, ${accent} 45%, transparent)` : undefined,
        ['--tw-ring-color' as string]: accentInk,
      }}
    >
      {children}
    </button>
  );
}
