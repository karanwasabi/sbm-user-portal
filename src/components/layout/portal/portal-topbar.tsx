'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PortalUserMenu } from '@/components/layout/portal/portal-user-menu';

const pageMeta: Record<string, string> = {
  '/subscription': 'Subscription',
  '/invoices': 'Invoices',
  '/profile': 'Profile',
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
        <button
          type="button"
          className="relative cursor-pointer rounded-full border border-slate-100 bg-white p-2 text-slate-500 transition-colors hover:border-slate-200"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-motivation" />
        </button>
        <PortalUserMenu />
      </div>
    </header>
  );
}
