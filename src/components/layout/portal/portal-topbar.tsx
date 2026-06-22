'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PortalUserMenu } from '@/components/layout/portal/portal-user-menu';

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

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-100 bg-canvas px-6">
      <div className="min-w-0 flex-1">
        {pageTitle && <h1 className="text-sm font-bold text-slate-800">{pageTitle}</h1>}
      </div>
      <div className="flex items-center gap-2.5">
        {right}
        <PortalUserMenu />
      </div>
    </header>
  );
}
