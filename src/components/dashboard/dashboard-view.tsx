'use client';

import { ArrowRight, MessageCircle, Sparkles, Video } from 'lucide-react';
import {
  DashboardQuickLink,
  InvoicesIllustration,
  ProfileIllustration,
  SubscriptionIllustration,
} from '@/components/dashboard/dashboard-quick-link';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDisplayName } from '@/types/profile';
import { cn } from '@/lib/cn';

const quickLinks = [
  {
    href: '/subscription',
    label: 'Subscription',
    sub: 'Plan & billing',
    illustration: <SubscriptionIllustration />,
    accentClass: 'bg-gradient-to-br from-success via-[#34D399] to-success-press',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-success group-hover:text-white',
    focusRingClass: 'focus-visible:ring-success',
  },
  {
    href: '/invoices',
    label: 'Invoices',
    sub: 'Download receipts',
    illustration: <InvoicesIllustration />,
    accentClass: 'bg-gradient-to-br from-motivation via-amber to-[#E88A0C]',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-motivation group-hover:text-slate-900',
    focusRingClass: 'focus-visible:ring-amber',
  },
  {
    href: '/profile',
    label: 'Profile',
    sub: 'Your details',
    illustration: <ProfileIllustration />,
    accentClass: 'bg-gradient-to-br from-lilac via-[#B794F6] to-brand-deep',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-brand-deep group-hover:text-white',
    focusRingClass: 'focus-visible:ring-brand-deep',
  },
] as const;

const highlights = [
  {
    icon: MessageCircle,
    text: 'Daily coach support on WhatsApp',
    iconWrap: 'bg-success/12 text-success',
  },
  {
    icon: Video,
    text: 'Weekly live webinars',
    iconWrap: 'bg-motivation/15 text-amber',
  },
  {
    icon: Sparkles,
    text: 'Simple, flexible nutrition guidance',
    iconWrap: 'bg-lilac/30 text-brand-deep',
  },
];

export function DashboardView() {
  const { profile } = usePortalProfile();
  const firstName = profile ? getDisplayName(profile) : 'there';

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Hey {firstName}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Manage your membership here. Enroll when you&apos;re ready — there&apos;s no rush.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-[#FFF6E0] via-[#FDF8FF] to-white px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-slate-900">Take Control</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Our flagship coach-led program. 3 months to start, then continue monthly.
          </p>
          <Button variant="amber" size="md" disabled className="mt-5" rightIcon={<ArrowRight size={14} />}>
            Enroll in Take Control
          </Button>
          <p className="mt-2 text-xs font-medium text-slate-400">Enrollment opens soon</p>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">What&apos;s included</p>
          <ul className="mt-3 space-y-2.5">
            {highlights.map(({ icon: Icon, text, iconWrap }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconWrap)}>
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <DashboardQuickLink key={link.href} {...link} />
        ))}
      </div>
    </div>
  );
}
