'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { PortalMobileNav } from '@/components/layout/portal/portal-mobile-nav';
import { PortalUserMenu } from '@/components/layout/portal/portal-user-menu';
import { PORTAL_HOME_PATH } from '@/lib/routes';

const pageMeta: Record<string, string> = {
  '/subscription': 'Subscription',
  '/invoices': 'Invoices',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/support': 'Help & Support',
};

type PortalTopbarProps = {
  right?: ReactNode;
};

export function PortalTopbar({ right }: PortalTopbarProps) {
  const pathname = usePathname();
  const pageTitle = pageMeta[pathname];
  const isHome = pathname === PORTAL_HOME_PATH;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-canvas px-4 sm:h-[68px] sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PortalMobileNav />
        {isHome ? (
          <div className="min-w-0 lg:hidden">
            <SbmWordmark size="sm" />
          </div>
        ) : pageTitle ? (
          <h1 className="truncate text-sm font-bold text-slate-800">{pageTitle}</h1>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {right}
        <PortalUserMenu />
      </div>
    </header>
  );
}
