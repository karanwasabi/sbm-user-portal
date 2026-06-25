'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { PortalNavLink } from '@/components/layout/portal/portal-nav-link';
import {
  isPortalNavActive,
  portalMainNavItems,
  portalSupportNavItem,
} from '@/components/layout/portal/portal-nav-items';

export function PortalMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,280px)] flex-col border-r border-slate-100 bg-canvas px-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-1">
              <SbmWordmark size="sm" />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-white/70"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-3 flex flex-col gap-1 overflow-y-auto">
              {portalMainNavItems.map((item) => (
                <PortalNavLink
                  key={item.href}
                  {...item}
                  isActive={isPortalNavActive(pathname, item.href)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-3">
              <PortalNavLink
                {...portalSupportNavItem}
                isActive={isPortalNavActive(pathname, portalSupportNavItem.href)}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
