'use client';

import { type InputHTMLAttributes, type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  leftIcon,
  rightIcon,
  disabled,
  autoComplete,
  className,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        'relative flex items-center rounded-2xl border-[1.5px] transition-all duration-120',
        disabled ? 'bg-slate-50' : 'bg-white',
        focused ? 'border-brand shadow-[0_0_0_4px_rgba(92,101,207,0.12)]' : 'border-slate-200',
        className
      )}
    >
      {leftIcon && <div className="flex pr-0.5 pl-3.5 text-slate-400">{leftIcon}</div>}
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        autoComplete={autoComplete}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          'min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-slate-800 outline-none',
          leftIcon ? 'py-3.25 pr-4 pl-2.5' : 'px-4 py-3.25'
        )}
      />
      {rightIcon && <div className="flex pr-3.5 pl-1 text-slate-400">{rightIcon}</div>}
    </div>
  );
}
