import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { isOnboardingComplete } from '@/lib/onboarding';
import { getLatestProfile } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    try {
      const profile = await getLatestProfile();
      if (isOnboardingComplete(profile)) {
        redirect('/');
      }
      redirect('/onboarding');
    } catch {
      redirect('/onboarding');
    }
  }

  return <SignupForm />;
}
