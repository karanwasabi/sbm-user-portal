'use client';

import { ArrowRight, MessageCircle, Sparkles, Target, Video } from 'lucide-react';
import {
  DashboardQuickLink,
  InvoicesIllustration,
  ProfileIllustration,
  SubscriptionIllustration,
} from '@/components/dashboard/dashboard-quick-link';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageShell } from '@/components/layout/portal/portal-page-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';
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

const includes = [
  { icon: MessageCircle, text: 'Coach support on WhatsApp', iconWrap: 'bg-success/12 text-success' },
  { icon: Video, text: 'Live webinars', iconWrap: 'bg-motivation/15 text-amber' },
  { icon: Sparkles, text: 'Flexible nutrition guidance', iconWrap: 'bg-lilac/30 text-brand-deep' },
  {
    icon: Target,
    text: 'Weekly goal reviews tailored to your progress',
    iconWrap: 'bg-brand/10 text-brand',
  },
];

export function DashboardView() {
  const { profile } = usePortalProfile();
  const firstName = profile ? getDisplayName(profile) : 'there';

  return (
    <PortalPageShell>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Hey {firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            You&apos;re signed in but not enrolled yet. Review the program below when you&apos;re ready.
          </p>
        </header>

        <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-stretch">
          <Card className="flex h-full flex-col">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900">Take Control</h2>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-600">
                  Coach-led program · 3 months to start, then monthly
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                  ₹9,000 <span className="text-lg font-bold text-slate-600">+ GST</span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">for the first 3 months</p>
              </div>
            </div>

            <ul className="mt-5 grid flex-1 grid-cols-1 content-start gap-2.5 border-t border-slate-100 pt-5 sm:grid-cols-2">
              {includes.map(({ icon: Icon, text, iconWrap }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconWrap)}>
                    <Icon size={14} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3 border-t border-slate-100 pt-5">
              <p className="text-xs leading-relaxed text-slate-500">
                Then ₹3,000 + GST / month · cancel anytime after the initial period
              </p>
              <Button variant="primary" size="lg" className="min-w-[280px]" rightIcon={<ArrowRight size={16} />}>
                Enroll in Take Control
              </Button>
            </div>
          </Card>

          <div className="h-full lg:sticky lg:top-6">
            <Card className="flex h-full flex-col">
              <SectionHead title="Before you enroll" subtitle="Good to know" />
              <ul className="mt-1 flex flex-1 flex-col justify-center space-y-3 text-sm text-slate-600">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>GST invoices appear under Invoices after your first charge.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>Cancelling stops the next renewal — you keep access until period end.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>Update payment method and billing address anytime from Subscription.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        <div>
          <SectionHead title="Quick links" subtitle="Billing, invoices, and account settings" />
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <DashboardQuickLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>
    </PortalPageShell>
  );
}
