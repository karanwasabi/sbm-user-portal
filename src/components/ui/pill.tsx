import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PillTone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger' | 'deep';

type PillProps = {
  children: ReactNode;
  tone?: PillTone;
  icon?: ReactNode;
  className?: string;
};

const toneClasses: Record<PillTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-[#EEF0FF] text-brand',
  success: 'bg-[#DCFCE7] text-success-press',
  warn: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E5] text-danger-press',
  deep: 'bg-[#EDE9FE] text-brand-deep',
};

export function Pill({ children, tone = 'neutral', icon, className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[10px] font-bold tracking-[0.12em] uppercase',
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
