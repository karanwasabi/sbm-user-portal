import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal/portal-shell';
import { hasProduct, PRODUCT_MEMBER_PORTAL } from '@/lib/access';
import { isOnboardingComplete } from '@/lib/onboarding';
import { getMyAccess } from '@/utils/access-api';
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

  if (!user.email_confirmed_at) {
    redirect(`/signup/verify?email=${encodeURIComponent(user.email ?? '')}`);
  }

  try {
    const access = await getMyAccess();
    if (!hasProduct(access.products, PRODUCT_MEMBER_PORTAL)) {
      redirect('/unauthorized');
    }
  } catch {
    redirect('/unauthorized');
  }

  let profile = null;
  let profileError: string | null = null;

  try {
    profile = await getLatestProfile();
    if (!isOnboardingComplete(profile)) {
      redirect('/onboarding');
    }
  } catch (error) {
    if (error instanceof ProfileFetchError && (error.status === 404 || error.status === 403)) {
      redirect('/onboarding');
    }
    profileError = error instanceof ProfileFetchError ? error.message : 'Failed to load profile.';
  }

  return (
    <PortalShell profile={profile} profileError={profileError}>
      {children}
    </PortalShell>
  );
}
