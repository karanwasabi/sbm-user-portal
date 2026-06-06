'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Profile } from '@/types/profile';

type PortalProfileContextValue = {
  profile: Profile | null;
  profileError: string | null;
};

const PortalProfileContext = createContext<PortalProfileContextValue>({
  profile: null,
  profileError: null,
});

export function PortalProfileProvider({
  profile,
  profileError,
  children,
}: PortalProfileContextValue & { children: ReactNode }) {
  return <PortalProfileContext.Provider value={{ profile, profileError }}>{children}</PortalProfileContext.Provider>;
}

export function usePortalProfile() {
  return useContext(PortalProfileContext);
}
