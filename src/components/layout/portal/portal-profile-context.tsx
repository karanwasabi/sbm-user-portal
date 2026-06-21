'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Profile } from '@/types/profile';
import type { Enrollment } from '@/types/enrollment';

type PortalProfileContextValue = {
  profile: Profile | null;
  profileError: string | null;
  enrollments: Enrollment[];
  showPasswordBanner: boolean;
};

const PortalProfileContext = createContext<PortalProfileContextValue>({
  profile: null,
  profileError: null,
  enrollments: [],
  showPasswordBanner: false,
});

export function PortalProfileProvider({
  profile,
  profileError,
  enrollments,
  showPasswordBanner,
  children,
}: PortalProfileContextValue & { children: ReactNode }) {
  return (
    <PortalProfileContext.Provider value={{ profile, profileError, enrollments, showPasswordBanner }}>
      {children}
    </PortalProfileContext.Provider>
  );
}

export function usePortalProfile() {
  return useContext(PortalProfileContext);
}
