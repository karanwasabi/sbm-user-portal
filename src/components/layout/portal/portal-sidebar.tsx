'use client';

import { CreditCard, FileText, HelpCircle, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { cn } from '@/lib/cn';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    activeClass: 'border-b-brand-press bg-brand font-bold text-white shadow-[0_8px_14px_-6px_rgba(92,101,207,0.40)]',
    iconActiveClass: 'text-white',
  },
  {
    href: '/subscription',
    label: 'Subscription',
    icon: CreditCard,
    activeClass:
      'border-b-success-press bg-success font-bold text-white shadow-[0_8px_14px_-6px_rgba(16,185,129,0.35)]',
    iconActiveClass: 'text-white',
  },
  {
    href: '/invoices',
    label: 'Invoices',
    icon: FileText,
    activeClass: 'border-b-[#E88A0C] bg-amber font-bold text-white shadow-[0_8px_14px_-6px_rgba(255,159,28,0.35)]',
    iconActiveClass: 'text-white',
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    activeClass:
      'border-b-brand-deep-press bg-brand-deep font-bold text-white shadow-[0_8px_14px_-6px_rgba(43,24,101,0.35)]',
    iconActiveClass: 'text-white',
  },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-slate-100 bg-canvas px-3.5 pb-[18px]">
      <div className="flex h-[68px] shrink-0 items-center border-b border-slate-100 px-2">
        <SbmWordmark size="sm" />
      </div>

      <nav className="mt-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, activeClass, iconActiveClass }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-[14px] px-3.5 py-[11px] text-[13.5px] font-semibold transition-colors',
                isActive ? activeClass : 'border-b-[3px] border-transparent text-slate-700 hover:bg-white/60'
              )}
            >
              <Icon size={17} className={isActive ? iconActiveClass : 'text-slate-500'} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <a
          href="#"
          className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white/60"
        >
          <HelpCircle size={16} className="text-slate-500" />
          Help &amp; support
        </a>
      </div>
    </aside>
  );
}
