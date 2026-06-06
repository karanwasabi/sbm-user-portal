'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DashboardQuickLinkProps = {
  href: string;
  label: string;
  sub: string;
  illustration: ReactNode;
  className?: string;
  accentClass: string;
  glowClass: string;
  hoverAccentClass: string;
  focusRingClass?: string;
};

export function DashboardQuickLink({
  href,
  label,
  sub,
  illustration,
  className,
  accentClass,
  glowClass,
  hoverAccentClass,
  focusRingClass = 'focus-visible:ring-brand',
}: DashboardQuickLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200',
        'hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_16px_32px_-12px_rgba(15,23,42,0.12)]',
        'active:translate-y-0 active:shadow-[0_4px_12px_-6px_rgba(15,23,42,0.10)]',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        focusRingClass,
        className
      )}
    >
      <div className={cn('relative h-[88px] overflow-hidden', accentClass)}>
        <div
          className={cn(
            'pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-60 blur-2xl',
            glowClass
          )}
        />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />
        <div className="relative flex h-full items-center justify-center px-4">{illustration}</div>
      </div>

      <div className="flex flex-1 items-end justify-between gap-2 p-4 pt-3.5">
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800">{label}</div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-500">{sub}</div>
        </div>
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400',
            'transition-all duration-200',
            hoverAccentClass
          )}
        >
          <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:rotate-12" />
        </div>
      </div>
    </Link>
  );
}

export function SubscriptionIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-[72px] w-[120px]" aria-hidden>
      <rect x="18" y="14" width="84" height="52" rx="10" fill="white" fillOpacity="0.95" />
      <rect x="18" y="14" width="84" height="14" rx="10" fill="white" fillOpacity="0.4" />
      <rect x="18" y="22" width="84" height="6" fill="#059669" fillOpacity="0.35" />
      <rect x="28" y="36" width="28" height="6" rx="3" fill="#CBD5E1" />
      <rect x="28" y="48" width="18" height="5" rx="2.5" fill="#E2E8F0" />
      <circle cx="88" cy="48" r="10" fill="#FFB703" fillOpacity="0.9" />
      <circle cx="88" cy="48" r="6" fill="#FF9F1C" fillOpacity="0.5" />
      <rect
        x="62"
        y="44"
        width="14"
        height="10"
        rx="3"
        fill="#10B981"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function InvoicesIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-[72px] w-[120px]" aria-hidden>
      <rect x="34" y="10" width="52" height="58" rx="8" fill="white" fillOpacity="0.35" transform="rotate(-8 34 10)" />
      <rect x="28" y="16" width="52" height="58" rx="8" fill="white" fillOpacity="0.55" transform="rotate(-3 28 16)" />
      <rect x="24" y="22" width="52" height="58" rx="8" fill="white" fillOpacity="0.95" />
      <rect x="32" y="32" width="24" height="4" rx="2" fill="#FFB703" fillOpacity="0.8" />
      <rect x="32" y="42" width="36" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="32" y="50" width="30" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="32" y="58" width="20" height="3" rx="1.5" fill="#E2E8F0" />
      <circle cx="82" cy="18" r="14" fill="#10B981" fillOpacity="0.9" />
      <path d="M76 18l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProfileIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-[72px] w-[120px]" aria-hidden>
      <circle cx="60" cy="34" r="22" fill="white" fillOpacity="0.95" />
      <circle cx="60" cy="28" r="9" fill="#C8B6FF" />
      <path d="M42 48c2.5-8 10-12 18-12s15.5 4 18 12" fill="#B794F6" />
      <circle cx="84" cy="20" r="10" fill="#FFB703" fillOpacity="0.85" />
      <path d="M81 20l2 2 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="22" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="92" cy="52" r="2.5" fill="white" fillOpacity="0.5" />
      <circle cx="22" cy="48" r="2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}
