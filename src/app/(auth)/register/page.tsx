import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { RegisterView } from '@/components/auth/register-view';
import {
  mergeRegisterDefaults,
  parseRegisterDraft,
  profileToRegisterDefaults,
  registerDraftToFormValues,
} from '@/lib/merge-profile-patch';
import { hasPortalAccess, isEnrolled } from '@/lib/onboarding';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { PENDING_DPDP_COOKIE } from '@/types/onboarding';
import { REGISTER_DRAFT_COOKIE } from '@/types/register';
import { fetchCountries, getBillingProfile, getLatestProfile, getMyEnrollments } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

type RegisterPageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialValues = null;
  let emailVerified = false;
  let initialDpdpConsent = false;
  let profileCountryCode: string | undefined;
  const cookieStore = await cookies();
  const draft = parseRegisterDraft(cookieStore.get(REGISTER_DRAFT_COOKIE)?.value);

  const [countries, suggestedCountryIso, params] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
    searchParams,
  ]);

  if (user?.email_confirmed_at && user.email) {
    emailVerified = true;

    try {
      const [loadedProfile, enrollments, billing] = await Promise.all([
        getLatestProfile().catch(() => null),
        getMyEnrollments().catch(() => []),
        getBillingProfile().catch(() => null),
      ]);
      profileCountryCode = loadedProfile?.country_code ?? undefined;
      if (loadedProfile && (hasPortalAccess(loadedProfile, enrollments) || isEnrolled(enrollments))) {
        redirect('/');
      }
      initialValues = profileToRegisterDefaults(loadedProfile, user.email, billing?.legal_name);
    } catch {
      initialValues = profileToRegisterDefaults(null, user.email);
    }
  } else if (user?.email) {
    const [loadedProfile, billing] = await Promise.all([
      getLatestProfile().catch(() => null),
      getBillingProfile().catch(() => null),
    ]);
    profileCountryCode = loadedProfile?.country_code ?? undefined;
    const legalName = billing?.legal_name;
    if (draft) {
      initialValues = mergeRegisterDefaults(registerDraftToFormValues(draft), loadedProfile, user.email, legalName);
      initialDpdpConsent = draft.dpdpConsent;
    } else {
      initialValues = profileToRegisterDefaults(loadedProfile, user.email, legalName);
    }
  } else if (draft) {
    initialValues = registerDraftToFormValues(draft);
    initialDpdpConsent = draft.dpdpConsent;
  }

  if (!draft || emailVerified) {
    initialDpdpConsent = emailVerified || cookieStore.get(PENDING_DPDP_COOKIE)?.value === '1';
  }

  return (
    <RegisterView
      initialValues={initialValues}
      emailVerified={emailVerified}
      showVerifiedToast={params.verified === '1'}
      initialDpdpConsent={initialDpdpConsent}
      fromDraft={Boolean(draft) && !emailVerified}
      countries={countries}
      suggestedCountryIso={initialValues?.whatsapp?.trim() ? undefined : (profileCountryCode ?? suggestedCountryIso)}
      initialWhatsappDialIso={draft?.whatsappDialIso}
    />
  );
}
