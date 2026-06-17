'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Profile } from '@/types/profile';
import type { Enrollment } from '@/types/enrollment';

type PortalProfileContextValue = {
  profile: Profile | null;
  profileError: string | null;
  enrollments: Enrollment[];
};

const PortalProfileContext = createContext<PortalProfileContextValue>({
  profile: null,
  profileError: null,
  enrollments: [],
});

export function PortalProfileProvider({
  profile,
  profileError,
  enrollments,
  children,
}: PortalProfileContextValue & { children: ReactNode }) {
  return (
    <PortalProfileContext.Provider value={{ profile, profileError, enrollments }}>
      {children}
    </PortalProfileContext.Provider>
  );
}

export function usePortalProfile() {
  return useContext(PortalProfileContext);
}
