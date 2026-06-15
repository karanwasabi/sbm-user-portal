'use client';

import { cn } from '@/lib/cn';
import { type ReactNode, forwardRef } from 'react';

type SelectInputProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  leftIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { value, onChange, options, placeholder, leftIcon, disabled, className },
  ref
) {
  return (
    <div
      className={cn(
        'relative flex items-center rounded-2xl border-[1.5px] border-slate-200 bg-white transition-all duration-120',
        disabled && 'bg-slate-50',
        className
      )}
    >
      {leftIcon && <div className="flex pr-0.5 pl-3.5 text-slate-400">{leftIcon}</div>}
      <select
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'min-w-0 flex-1 appearance-none border-none bg-transparent py-3.25 text-sm font-medium text-slate-800 outline-none',
          leftIcon ? 'pr-8 pl-2.5' : 'px-4 pr-8'
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});
