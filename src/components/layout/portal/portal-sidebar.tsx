'use client';

import { CreditCard, FileText, HelpCircle, Home, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/(portal)/actions';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { getFullName, getInitials } from '@/types/profile';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { profile } = usePortalProfile();

  const displayName = profile ? getFullName(profile) : 'Member';
  const email = profile?.email ?? '';
  const initials = profile ? getInitials(profile) : 'SB';

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col gap-1 border-r border-slate-100 bg-canvas px-3.5 pt-[22px] pb-[18px]">
      <div className="border-b border-slate-100 px-2 pb-[18px]">
        <SbmWordmark size="sm" />
      </div>

      <div className="h-3" />

      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-[14px] px-3.5 py-[11px] text-[13.5px] font-semibold transition-colors',
              isActive
                ? 'border-b-[3px] border-brand-press bg-brand font-bold text-white shadow-[0_8px_14px_-6px_rgba(92,101,207,0.40)]'
                : 'border-b-[3px] border-transparent text-slate-700 hover:bg-white/60'
            )}
          >
            <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
            <span className="flex-1">{label}</span>
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-2.5">
        <a
          href="#"
          className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-xs font-semibold text-slate-600"
        >
          <HelpCircle size={16} className="text-slate-500" />
          Help &amp; support
        </a>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-slate-800">{displayName}</div>
            <div className="truncate text-[10.5px] text-slate-500">{email}</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer p-1.5 text-slate-400 transition-colors hover:text-slate-600"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
