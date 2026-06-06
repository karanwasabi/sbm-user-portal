'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Home',
    subtitle: 'Subscription, status & quick actions',
  },
  '/subscription': {
    title: 'Subscription',
    subtitle: 'Current plan · billing schedule · cancel',
  },
  '/invoices': {
    title: 'Invoices',
    subtitle: 'GST-compliant tax invoices · downloadable PDFs',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Personal details · security · notifications',
  },
};

type PortalTopbarProps = {
  right?: ReactNode;
};

export function PortalTopbar({ right }: PortalTopbarProps) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta['/'];

  return (
    <div className="flex shrink-0 items-center gap-[18px] border-b border-slate-100 bg-canvas px-7 py-5">
      <div className="min-w-0 flex-1">
        <div className="text-xl font-bold tracking-tight text-slate-800">{meta.title}</div>
        <div className="mt-0.5 text-xs font-medium text-slate-500">{meta.subtitle}</div>
      </div>
      {right}
      <button
        type="button"
        className="relative cursor-pointer rounded-full border border-slate-100 bg-white p-2.5 text-slate-600"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full bg-motivation" />
      </button>
    </div>
  );
}
