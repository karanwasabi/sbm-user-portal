import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { getPostAuthRedirectPath } from '@/lib/onboarding';
import { getLatestProfile, getMyEnrollments } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    try {
      const profile = await getLatestProfile();
      const enrollments = await getMyEnrollments();
      redirect(getPostAuthRedirectPath(profile, enrollments));
    } catch {
      redirect('/onboarding');
    }
  }

  return <SignupForm />;
}
