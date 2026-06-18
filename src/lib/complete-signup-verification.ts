'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DPDP_PRIVACY_URL, DPDP_TERMS_URL } from '@/lib/dpdp-consent';
import { PENDING_DPDP_COOKIE, SIGNUP_EMAIL_COOKIE } from '@/types/signup';
import { ProfileFetchError, recordDpdpConsent } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export type CompleteSignupVerificationResult = {
  error: string | null;
};

/** Shared post-verify step for OTP submit and email confirmation links. */
export async function completeSignupVerification(): Promise<CompleteSignupVerificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'This confirmation link is invalid or has expired.' };
  }

  if (!user.email_confirmed_at) {
    return { error: 'Your email is not verified yet. Enter the code from your email instead.' };
  }

  await supabase.auth.refreshSession();

  const cookieStore = await cookies();
  const pendingDpdp = cookieStore.get(PENDING_DPDP_COOKIE)?.value === '1';
  cookieStore.delete(SIGNUP_EMAIL_COOKIE);
  cookieStore.delete(PENDING_DPDP_COOKIE);

  if (pendingDpdp) {
    try {
      await recordDpdpConsent(DPDP_TERMS_URL, DPDP_PRIVACY_URL);
    } catch (consentError) {
      const message =
        consentError instanceof ProfileFetchError
          ? consentError.message
          : 'Your email was verified but we could not save your consent. Please contact support.';
      return { error: message };
    }
  }

  redirect('/onboarding?verified=1');
}
