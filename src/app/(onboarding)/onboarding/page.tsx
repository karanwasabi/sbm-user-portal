import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { isOnboardingComplete } from '@/lib/onboarding';
import { getLatestProfile, fetchCountries } from '@/utils/api';
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
    redirect(`/signup/verify?email=${encodeURIComponent(user.email ?? '')}`);
  }

  let profile = null;
  try {
    profile = await getLatestProfile();
    if (isOnboardingComplete(profile)) {
      redirect('/');
    }
  } catch {
    // Profile may not be loadable yet; show onboarding from empty state.
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
      showVerifiedToast={showVerifiedToast}
      countries={countries}
    />
  );
}
