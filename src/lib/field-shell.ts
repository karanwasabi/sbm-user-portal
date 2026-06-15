import { cn } from '@/lib/cn';

/** Shared shell styling — keep pickers and text fields visually aligned. */
export const fieldShell = {
  base: 'rounded-2xl border-[1.5px] transition-all duration-120',
  default: 'border-slate-200 bg-white',
  focused: 'border-brand',
  disabled: 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
  selected: 'border-brand bg-canvas-cool text-slate-900',
  hover: 'hover:border-slate-300 hover:bg-slate-50/80',
  focusRing: 'focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15',
} as const;

export function fieldShellClass({
  focused = false,
  open = false,
  selected = false,
  disabled = false,
  className,
}: {
  focused?: boolean;
  open?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    fieldShell.base,
    disabled && fieldShell.disabled,
    !disabled && (focused || open || selected) && fieldShell.focused,
    !disabled && selected && fieldShell.selected,
    !disabled && !selected && fieldShell.default,
    className
  );
}
