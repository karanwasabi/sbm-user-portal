import { redirect } from 'next/navigation';
import { RegisterView } from '@/components/auth/register-view';
import { profileToRegisterDefaults } from '@/lib/merge-profile-patch';
import { hasPortalAccess, isEnrolled } from '@/lib/onboarding';
import { fetchCountries, getLatestProfile, getMyEnrollments } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialValues = null;
  let emailVerified = false;
  const countries = await fetchCountries().catch(() => []);

  if (user?.email_confirmed_at) {
    emailVerified = true;
    try {
      const [profile, enrollments] = await Promise.all([
        getLatestProfile().catch(() => null),
        getMyEnrollments().catch(() => []),
      ]);
      if (profile && (hasPortalAccess(profile, enrollments) || isEnrolled(enrollments))) {
        redirect('/');
      }
      if (profile && user.email) {
        initialValues = profileToRegisterDefaults(profile, user.email);
      }
    } catch {
      // Allow register page for authenticated users without enrollment.
    }
  }

  return <RegisterView initialValues={initialValues} emailVerified={emailVerified} countries={countries} />;
}
