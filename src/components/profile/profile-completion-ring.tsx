'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

type ProfileCompletionRingProps = {
  percent: number;
  className?: string;
};

const SIZE = 72;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileCompletionRing({ percent, className }: ProfileCompletionRingProps) {
  const gradientId = useId();
  const clamped = Math.max(0, Math.min(100, percent));
  const isComplete = clamped >= 100;
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      className={cn('flex shrink-0 flex-col items-center gap-1.5', className)}
      role="img"
      aria-label={`Profile ${clamped}% complete`}
    >
      <div className="relative">
        {!isComplete ? (
          <span aria-hidden className="absolute inset-0 animate-pulse rounded-full bg-brand/10 blur-md" />
        ) : null}

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative block">
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-slate-100"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isComplete ? '#10B981' : '#5C65CF'} />
              <stop offset="100%" stopColor={isComplete ? '#059669' : '#B794F6'} />
            </linearGradient>
          </defs>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-[17px] leading-none font-extrabold tracking-tight',
              isComplete ? 'text-success' : 'text-brand-deep'
            )}
          >
            {clamped}%
          </span>
        </div>
      </div>

      <p
        className={cn(
          'max-w-[5.5rem] text-center text-[10px] leading-snug font-semibold',
          isComplete ? 'text-success' : 'text-slate-500'
        )}
      >
        {isComplete ? 'Your profile is complete' : 'Profile completion'}
      </p>
    </div>
  );
}
