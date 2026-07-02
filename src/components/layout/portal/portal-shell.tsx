'use client';

import type { ReactNode } from 'react';
import { PortalLoginAnalytics } from '@/components/analytics/portal-login-analytics';
import { PaymentCompleteToast } from '@/components/dashboard/payment-complete-toast';
import { PendingCheckoutRecovery } from '@/components/checkout/pending-checkout-recovery';
import { PortalProfileProvider } from '@/components/layout/portal/portal-profile-context';
import { PortalSidebar } from '@/components/layout/portal/portal-sidebar';
import { PortalTopbar } from '@/components/layout/portal/portal-topbar';
import { ToastProvider } from '@/components/ui/toast';
import type { Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';

type PortalShellProps = {
  profile: Profile | null;
  profileError: string | null;
  enrollments: Enrollment[];
  showPasswordBanner?: boolean;
  children: ReactNode;
};

export function PortalShell({
  profile,
  profileError,
  enrollments,
  showPasswordBanner = false,
  children,
}: PortalShellProps) {
  return (
    <PortalProfileProvider
      profile={profile}
      profileError={profileError}
      enrollments={enrollments}
      showPasswordBanner={showPasswordBanner}
    >
      <ToastProvider>
        <PortalLoginAnalytics />
        <PaymentCompleteToast />
        <PendingCheckoutRecovery />
        <div className="flex h-dvh min-w-0 bg-white">
          <PortalSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <PortalTopbar />
            {profileError && (
              <div className="border-b border-[#FEE2E5] bg-[#FEE2E5]/40 px-4 py-2.5 text-sm font-medium text-danger-press sm:px-6">
                {profileError}
              </div>
            )}
            <div className="flex flex-1 [scrollbar-gutter:stable] flex-col overflow-auto bg-canvas">{children}</div>
          </div>
        </div>
      </ToastProvider>
    </PortalProfileProvider>
  );
}
