import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { getLatestProfile } from '@/utils/api';

function isRegistrationComplete(profile: Awaited<ReturnType<typeof getLatestProfile>>): boolean {
  return Boolean(
    profile.first_name &&
    profile.date_of_birth &&
    profile.sex &&
    profile.country_code &&
    profile.timezone_id &&
    profile.meal_preference
  );
}

export default async function SignupPage() {
  try {
    const profile = await getLatestProfile();
    if (isRegistrationComplete(profile)) {
      redirect('/');
    }
  } catch {
    // Unauthenticated or profile unavailable — show the wizard.
  }

  return <SignupForm />;
}
