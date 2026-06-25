import { CreditCard, FileText, HelpCircle, Home, Settings, User, type LucideIcon } from 'lucide-react';
import { invoicesNavEnabled } from '@/lib/portal-features';

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activeClass: string;
  iconActiveClass: string;
};

export const portalMainNavItems: PortalNavItem[] = [
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
  ...(invoicesNavEnabled
    ? [
        {
          href: '/invoices',
          label: 'Invoices',
          icon: FileText,
          activeClass:
            'border-b-[#E88A0C] bg-amber font-bold text-white shadow-[0_8px_14px_-6px_rgba(255,159,28,0.35)]',
          iconActiveClass: 'text-white',
        },
      ]
    : []),
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    activeClass:
      'border-b-brand-deep-press bg-brand-deep font-bold text-white shadow-[0_8px_14px_-6px_rgba(43,24,101,0.35)]',
    iconActiveClass: 'text-white',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    activeClass: 'border-b-slate-600 bg-slate-700 font-bold text-white shadow-[0_8px_14px_-6px_rgba(51,65,85,0.35)]',
    iconActiveClass: 'text-white',
  },
];

export const portalSupportNavItem: PortalNavItem = {
  href: '/support',
  label: 'Help & Support',
  icon: HelpCircle,
  activeClass: 'border-b-support-press bg-support font-bold text-white shadow-[0_8px_14px_-6px_rgba(14,165,233,0.35)]',
  iconActiveClass: 'text-white',
};

export function isPortalNavActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
