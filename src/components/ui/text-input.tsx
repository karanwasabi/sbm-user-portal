'use client';

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    value,
    onChange,
    placeholder,
    type = 'text',
    leftIcon,
    rightIcon,
    disabled,
    autoComplete,
    autoFocus,
    error = false,
    className,
    ...props
  },
  ref
) {
  return (
    <InputGroup
      className={cn(
        'h-11 rounded-2xl bg-background shadow-none',
        error && 'border-destructive ring-3 ring-destructive/20',
        className
      )}
    >
      {leftIcon ? <InputGroupAddon className="pl-3.5 text-muted-foreground">{leftIcon}</InputGroupAddon> : null}
      <InputGroupInput
        {...props}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={error || undefined}
        className={cn('py-3 text-sm font-medium', leftIcon ? 'px-2' : 'px-3.5')}
      />
      {rightIcon ? (
        <InputGroupAddon align="inline-end" className="pr-3.5 text-muted-foreground">
          {rightIcon}
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
});
