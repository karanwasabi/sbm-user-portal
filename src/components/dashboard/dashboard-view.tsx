'use client';

import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import {
  DashboardQuickLink,
  InvoicesIllustration,
  ProfileIllustration,
  SubscriptionIllustration,
} from '@/components/dashboard/dashboard-quick-link';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageShell } from '@/components/layout/portal/portal-page-shell';
import { SectionHead } from '@/components/ui/section-head';
import { getDisplayName, getFullName } from '@/types/profile';

const quickLinks = [
  {
    href: '/subscription',
    label: 'Subscription',
    sub: 'Plan & Billing',
    illustration: <SubscriptionIllustration />,
    accentClass: 'bg-gradient-to-br from-success via-[#34D399] to-success-press',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-success group-hover:text-white',
    focusRingClass: 'focus-visible:ring-success',
  },
  {
    href: '/invoices',
    label: 'Invoices',
    sub: 'Download Receipts',
    illustration: <InvoicesIllustration />,
    accentClass: 'bg-gradient-to-br from-motivation via-amber to-[#E88A0C]',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-motivation group-hover:text-slate-900',
    focusRingClass: 'focus-visible:ring-amber',
  },
  {
    href: '/profile',
    label: 'Profile',
    sub: 'Your Details',
    illustration: <ProfileIllustration />,
    accentClass: 'bg-gradient-to-br from-lilac via-[#B794F6] to-brand-deep',
    glowClass: 'bg-white',
    hoverAccentClass: 'group-hover:bg-brand-deep group-hover:text-white',
    focusRingClass: 'focus-visible:ring-brand-deep',
  },
] as const;

export function DashboardView() {
  const { profile, enrollments, showPasswordBanner } = usePortalProfile();
  const firstName = profile ? getDisplayName(profile) : 'there';

  const legalName = profile ? getFullName(profile) : 'Member';

  return (
    <PortalPageShell>
      <div className="flex flex-col gap-8">
        <DashboardHero
          firstName={firstName}
          profile={profile}
          enrollments={enrollments}
          showPasswordBanner={showPasswordBanner}
          paymentRetryLegalName={legalName}
        />

        <div>
          <SectionHead title="Quick Links" subtitle="Billing, invoices, and account settings" />
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((link) => (
              <DashboardQuickLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>
    </PortalPageShell>
  );
}
