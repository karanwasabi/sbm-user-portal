'use client';

import type { ReactNode } from 'react';
import { PortalProfileProvider } from '@/components/layout/portal/portal-profile-context';
import { PortalSidebar } from '@/components/layout/portal/portal-sidebar';
import { PortalTopbar } from '@/components/layout/portal/portal-topbar';
import type { Profile } from '@/types/profile';

type PortalShellProps = {
  profile: Profile | null;
  profileError: string | null;
  children: ReactNode;
};

export function PortalShell({ profile, profileError, children }: PortalShellProps) {
  return (
    <PortalProfileProvider profile={profile} profileError={profileError}>
      <div className="flex h-dvh min-w-0 bg-white">
        <PortalSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalTopbar />
          {profileError && (
            <div className="border-b border-[#FEE2E5] bg-[#FEE2E5]/40 px-7 py-2.5 text-sm font-medium text-danger-press">
              {profileError}
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-auto bg-canvas">{children}</div>
        </div>
      </div>
    </PortalProfileProvider>
  );
}
