'use client';

import { usePathname } from 'next/navigation';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { PortalNavLink } from '@/components/layout/portal/portal-nav-link';
import {
  isPortalNavActive,
  portalMainNavItems,
  portalSupportNavItem,
} from '@/components/layout/portal/portal-nav-items';

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-[232px] shrink-0 flex-col border-r border-slate-100 bg-canvas px-3.5 pb-[18px] lg:flex">
      <div className="flex h-[68px] shrink-0 items-center border-b border-slate-100 px-2">
        <SbmWordmark size="sm" />
      </div>

      <nav className="mt-3 flex flex-col gap-1">
        {portalMainNavItems.map((item) => (
          <PortalNavLink key={item.href} {...item} isActive={isPortalNavActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-3">
        <PortalNavLink {...portalSupportNavItem} isActive={isPortalNavActive(pathname, portalSupportNavItem.href)} />
      </div>
    </aside>
  );
}
