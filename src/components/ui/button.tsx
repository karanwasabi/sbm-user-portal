'use client';

import { type ButtonHTMLAttributes, type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'light' | 'ghost' | 'success' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, { base: string; lip: string }> = {
  primary: {
    base: 'bg-brand text-white shadow-brand',
    lip: 'border-b-brand-press',
  },
  light: {
    base: 'bg-white text-brand shadow-sm',
    lip: 'border-b-slate-200',
  },
  ghost: {
    base: 'bg-transparent text-slate-700',
    lip: 'border-b-transparent',
  },
  success: {
    base: 'bg-success text-white shadow-[0_8px_14px_-4px_rgba(16,185,129,0.30)]',
    lip: 'border-b-success-press',
  },
  danger: {
    base: 'bg-danger text-white shadow-[0_8px_14px_-4px_rgba(244,63,94,0.30)]',
    lip: 'border-b-danger-press',
  },
};

const sizeClasses: Record<ButtonSize, { base: string; lip: string; pressedLip: string }> = {
  sm: {
    base: 'rounded-2xl px-4 py-2.25 text-xs',
    lip: 'border-b-[3px]',
    pressedLip: 'border-b',
  },
  md: {
    base: 'rounded-[20px] px-5 py-2.75 text-[13.5px]',
    lip: 'border-b-4',
    pressedLip: 'border-b',
  },
  lg: {
    base: 'rounded-3xl px-6 py-4 text-[15px]',
    lip: 'border-b-[5px]',
    pressedLip: 'border-b',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const variantStyle = variantClasses[disabled ? 'ghost' : variant];
  const sizeStyle = sizeClasses[size];

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      onPointerDown={(e) => {
        if (!disabled) setPressed(true);
        props.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        props.onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        setPressed(false);
        props.onPointerLeave?.(e);
      }}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 border-x-0 border-t-0 font-semibold transition-all duration-100 outline-none',
        sizeStyle.base,
        fullWidth && 'w-full',
        disabled
          ? 'cursor-not-allowed border-b-slate-200 bg-slate-100 text-slate-400 shadow-none'
          : cn(variantStyle.base, variantStyle.lip, pressed ? sizeStyle.pressedLip : sizeStyle.lip),
        pressed && !disabled && 'translate-y-1 scale-[0.992] shadow-none',
        className
      )}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
