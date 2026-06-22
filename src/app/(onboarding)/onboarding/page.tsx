import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { hasPortalAccess, isOnboardingComplete } from '@/lib/onboarding';
import { getLatestProfile, fetchCountries, getMyEnrollments } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

type OnboardingPageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
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

  let profile = null;
  let enrollments: Awaited<ReturnType<typeof getMyEnrollments>> = [];

  try {
    profile = await getLatestProfile();
  } catch {
    // Profile may not be loadable yet; show onboarding from empty state.
  }

  try {
    enrollments = await getMyEnrollments();
  } catch {
    enrollments = [];
  }

  if (hasPortalAccess(profile, enrollments) || isOnboardingComplete(profile, enrollments)) {
    redirect('/');
  }

  const params = await searchParams;
  const showVerifiedToast = params.verified === '1';

  let countries: Awaited<ReturnType<typeof fetchCountries>> = [];
  try {
    countries = await fetchCountries();
  } catch {
    countries = [];
  }

  return (
    <OnboardingForm
      profile={profile}
      email={user.email ?? ''}
      enrollments={enrollments}
      showVerifiedToast={showVerifiedToast}
      countries={countries}
    />
  );
}
