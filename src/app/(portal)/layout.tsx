import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal/portal-shell';
import { getLatestProfile, ProfileFetchError } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile = null;
  let profileError: string | null = null;

  try {
    profile = await getLatestProfile();
  } catch (error) {
    profileError = error instanceof ProfileFetchError ? error.message : 'Failed to load profile.';
  }

  return (
    <PortalShell profile={profile} profileError={profileError}>
      {children}
    </PortalShell>
  );
}
