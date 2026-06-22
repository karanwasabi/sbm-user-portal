import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal/portal-shell';
import { hasProduct, PRODUCT_MEMBER_PORTAL } from '@/lib/access';
import { hasPortalAccess } from '@/lib/onboarding';
import { userNeedsPassword } from '@/lib/razorpay-checkout';
import { getMyAccess } from '@/utils/access-api';
import { getLatestProfile, getMyEnrollments, ProfileFetchError } from '@/utils/api';
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
    redirect('/register');
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
  let enrollments: Awaited<ReturnType<typeof getMyEnrollments>> = [];

  try {
    profile = await getLatestProfile();
  } catch (error) {
    if (error instanceof ProfileFetchError && (error.status === 404 || error.status === 403)) {
      redirect('/onboarding');
    }
    profileError = error instanceof ProfileFetchError ? error.message : 'Failed to load profile.';
  }

  try {
    enrollments = await getMyEnrollments();
  } catch {
    enrollments = [];
  }

  if (profile && !hasPortalAccess(profile, enrollments)) {
    redirect('/onboarding');
  }

  const showPasswordBanner = userNeedsPassword(user);

  return (
    <PortalShell
      profile={profile}
      profileError={profileError}
      enrollments={enrollments}
      showPasswordBanner={showPasswordBanner}
    >
      {children}
    </PortalShell>
  );
}
