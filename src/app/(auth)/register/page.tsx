import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { RegisterView } from '@/components/auth/register-view';
import { parseRegisterDraft, profileToRegisterDefaults, registerDraftToFormValues } from '@/lib/merge-profile-patch';
import { hasPortalAccess, isEnrolled } from '@/lib/onboarding';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { PENDING_DPDP_COOKIE } from '@/types/signup';
import { REGISTER_DRAFT_COOKIE } from '@/types/register';
import { fetchCountries, getLatestProfile, getMyEnrollments } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialValues = null;
  let emailVerified = false;
  let initialDpdpConsent = false;
  const cookieStore = await cookies();
  const draft = parseRegisterDraft(cookieStore.get(REGISTER_DRAFT_COOKIE)?.value);

  if (draft) {
    initialValues = registerDraftToFormValues(draft);
    initialDpdpConsent = draft.dpdpConsent;
  }

  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  if (!draft && user?.email_confirmed_at) {
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

  if (!draft) {
    initialDpdpConsent = emailVerified || cookieStore.get(PENDING_DPDP_COOKIE)?.value === '1';
  }

  return (
    <RegisterView
      initialValues={initialValues}
      emailVerified={emailVerified}
      initialDpdpConsent={initialDpdpConsent}
      fromDraft={Boolean(draft)}
      countries={countries}
      suggestedCountryIso={initialValues?.whatsapp?.trim() ? undefined : suggestedCountryIso}
    />
  );
}
