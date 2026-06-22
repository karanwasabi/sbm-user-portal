'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type PortalNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  activeClass: string;
  iconActiveClass: string;
};

function PortalNavLinkInner({
  label,
  icon: Icon,
  isActive,
  iconActiveClass,
}: Pick<PortalNavLinkProps, 'label' | 'icon' | 'isActive' | 'iconActiveClass'>) {
  const { pending } = useLinkStatus();

  return (
    <>
      <Icon
        size={17}
        className={cn(isActive ? iconActiveClass : 'text-slate-500', pending && !isActive && 'opacity-60')}
      />
      <span className={cn('flex-1', pending && !isActive && 'opacity-70')}>{label}</span>
      {pending ? <Loader2 size={14} className="shrink-0 animate-spin text-slate-400" aria-hidden /> : null}
    </>
  );
}

export function PortalNavLink({ href, label, icon, isActive, activeClass, iconActiveClass }: PortalNavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-[14px] px-3.5 py-[11px] text-[13.5px] font-semibold transition-colors',
        isActive ? activeClass : 'border-b-[3px] border-transparent text-slate-700 hover:bg-white/60'
      )}
    >
      <PortalNavLinkInner label={label} icon={icon} isActive={isActive} iconActiveClass={iconActiveClass} />
    </Link>
  );
}
