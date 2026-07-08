'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { DPDP_PRIVACY_URL, DPDP_TERMS_URL } from '@/lib/dpdp-consent';
import { emailOtpInvalidMessage, isValidEmailOtp } from '@/lib/email-otp';
import { formatUserFacingError } from '@/lib/format-user-error';
import { buildRegisterProfilePatch, registerDraftFromValues, type RegisterFormValues } from '@/lib/merge-profile-patch';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import {
  firstRegisterFieldError,
  validateRegisterForm,
  type RegisterFieldErrors,
} from '@/lib/register-form-validation';
import { syncPasswordSetMetadata } from '@/lib/sync-password-set-metadata';
import { getMyEnrollments, patchProfile, ProfileFetchError, recordDpdpConsent, registerMember } from '@/utils/api';
import { hasPaidTakeControlEnrollment } from '@/types/enrollment';
import type { RegisterStartState, RegisterVerifyState } from '@/types/register';
import { ASSISTED_REGISTER_COOKIE, REGISTER_DRAFT_COOKIE, REGISTER_EMAIL_COOKIE } from '@/types/register';
import { UTM_ATTRIBUTION_COOKIE, type UtmAttribution } from '@/lib/utm-attribution';
import { createClient } from '@/utils/supabase/server';

const REGISTER_FLOW_COOKIE = 'sbm_register_flow';
const REGISTER_DPDP_COOKIE = 'sbm_pending_dpdp';

async function getForwardedHeaders(): Promise<HeadersInit> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const out: Record<string, string> = {};
  if (forwarded) out['X-Forwarded-For'] = forwarded;
  if (realIp) out['X-Real-IP'] = realIp;
  return out;
}

function parseRegisterForm(
  formData: FormData
): RegisterFormValues & { dpdpConsent: boolean; whatsappDialIso?: string } {
  return {
    firstName: String(formData.get('firstName') ?? '').trim(),
    lastName: String(formData.get('lastName') ?? '').trim(),
    email: String(formData.get('email') ?? '')
      .trim()
      .toLowerCase(),
    whatsapp: String(formData.get('whatsapp') ?? '').trim(),
    whatsappDialIso:
      String(formData.get('whatsappDialIso') ?? '')
        .trim()
        .toUpperCase() || undefined,
    sex: String(formData.get('sex') ?? '') as RegisterFormValues['sex'],
    dateOfBirth: String(formData.get('dateOfBirth') ?? '').trim(),
    parentalConsent: formData.get('parentalConsent') === 'true',
    dpdpConsent: formData.get('dpdpConsent') === 'true',
  };
}

function validateRegisterFormValues(values: ReturnType<typeof parseRegisterForm>): RegisterFieldErrors {
  return validateRegisterForm(values);
}

function parseUtmAttributionCookie(value?: string): UtmAttribution | null {
  if (!value?.trim()) return null;
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as UtmAttribution;
    return {
      utm_source: parsed.utm_source?.trim() || undefined,
      utm_medium: parsed.utm_medium?.trim() || undefined,
      utm_campaign: parsed.utm_campaign?.trim() || undefined,
      utm_content: parsed.utm_content?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export async function startRegister(_prev: RegisterStartState, formData: FormData): Promise<RegisterStartState> {
  const values = parseRegisterForm(formData);
  const fieldErrors = validateRegisterFormValues(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: null,
      fieldErrors,
      focusField: firstRegisterFieldError(fieldErrors),
      status: null,
      email: null,
    };
  }

  try {
    const cookieStore = await cookies();
    const utmAttribution = parseUtmAttributionCookie(cookieStore.get(UTM_ATTRIBUTION_COOKIE)?.value);
    const assistedFromForm = formData.get('assisted') === '1';
    const assisted = assistedFromForm || cookieStore.get(ASSISTED_REGISTER_COOKIE)?.value === '1';

    if (assistedFromForm) {
      cookieStore.set(ASSISTED_REGISTER_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
      });
    }

    const result = await registerMember(
      {
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        whatsapp: values.whatsapp,
        sex: values.sex,
        date_of_birth: values.dateOfBirth,
        parental_consent: values.parentalConsent,
        dpdp_consent: values.dpdpConsent,
        assisted,
        ...utmAttribution,
      },
      await getForwardedHeaders()
    );

    if (result.status === 'already_registered') {
      return { error: null, status: 'already_registered', email: values.email };
    }

    if (assisted && result.status === 'already_enrolled') {
      return { error: null, status: 'already_enrolled', email: values.email };
    }

    cookieStore.delete(REGISTER_DRAFT_COOKIE);
    cookieStore.set(REGISTER_EMAIL_COOKIE, values.email, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });
    cookieStore.set(REGISTER_DPDP_COOKIE, values.dpdpConsent ? '1' : '0', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    const resumeFlow = result.status === 'resume' || result.status === 'already_enrolled';
    cookieStore.set(REGISTER_FLOW_COOKIE, resumeFlow ? 'resume' : 'signup', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return { error: null, status: result.status, email: values.email };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const message = err instanceof ProfileFetchError ? err.message : 'Failed to start registration.';
    return { error: message, status: null, email: null };
  }
}

export async function verifyRegisterOtp(_prev: RegisterVerifyState, formData: FormData): Promise<RegisterVerifyState> {
  const cookieStore = await cookies();
  const email =
    cookieStore.get(REGISTER_EMAIL_COOKIE)?.value ??
    String(formData.get('email') ?? '')
      .trim()
      .toLowerCase();
  const token = String(formData.get('otp') ?? '').trim();
  const flow = cookieStore.get(REGISTER_FLOW_COOKIE)?.value ?? 'signup';

  if (!email) {
    return { error: 'Enter your email and request a verification code first.', verified: false };
  }
  if (!isValidEmailOtp(token)) {
    return { error: emailOtpInvalidMessage(), verified: false };
  }

  const supabase = await createClient();
  const otpType = flow === 'resume' ? 'email' : 'signup';
  const { error } = await supabase.auth.verifyOtp({ email, token, type: otpType });
  if (error) {
    return { error: formatUserFacingError(error.message), verified: false };
  }

  try {
    await completeRegisterProfile(formData);
  } catch (err) {
    const message = err instanceof ProfileFetchError ? err.message : 'Failed to save your profile.';
    return { error: message, verified: false };
  }

  try {
    const enrollments = await getMyEnrollments();
    if (hasPaidTakeControlEnrollment(enrollments)) {
      redirect(PORTAL_HOME_PATH);
    }
  } catch {
    // Continue to registration checkout if enrollment status is unavailable.
  }

  return { error: null, verified: true };
}

/** Signs out, saves the current form as a draft, and returns to registration for edits (re-OTP required). */
export async function restartRegisterEditing(formData: FormData): Promise<void> {
  const values = parseRegisterForm(formData);
  const cookieStore = await cookies();
  const assisted = formData.get('assisted') === '1' || cookieStore.get(ASSISTED_REGISTER_COOKIE)?.value === '1';

  cookieStore.set(REGISTER_DRAFT_COOKIE, JSON.stringify(registerDraftFromValues(values)), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  });
  cookieStore.delete(REGISTER_EMAIL_COOKIE);
  cookieStore.delete(REGISTER_FLOW_COOKIE);
  if (values.dpdpConsent) {
    cookieStore.set(REGISTER_DPDP_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });
  } else {
    cookieStore.delete(REGISTER_DPDP_COOKIE);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect(assisted ? '/register/assisted' : '/subscribe');
}

async function completeRegisterProfile(formData: FormData): Promise<void> {
  const values = parseRegisterForm(formData);
  const patch = buildRegisterProfilePatch(values);
  if (Object.keys(patch).length > 0) {
    await patchProfile(patch);
  }

  const cookieStore = await cookies();
  if (cookieStore.get(REGISTER_DPDP_COOKIE)?.value === '1') {
    await recordDpdpConsent(DPDP_TERMS_URL, DPDP_PRIVACY_URL, 'register');
    cookieStore.delete(REGISTER_DPDP_COOKIE);
  }
}

export async function clearRegisterDraft(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REGISTER_DRAFT_COOKIE);
}

export async function resetAssistedRegister(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REGISTER_EMAIL_COOKIE);
  cookieStore.delete(REGISTER_FLOW_COOKIE);
  cookieStore.delete(REGISTER_DRAFT_COOKIE);
  cookieStore.delete(REGISTER_DPDP_COOKIE);

  const supabase = await createClient();
  // Local only: staff is switching customers on this device; skip the slow global revoke round-trip.
  await supabase.auth.signOut({ scope: 'local' });

  redirect('/register/assisted');
}

export async function resendRegisterOtp(): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  const email = cookieStore.get(REGISTER_EMAIL_COOKIE)?.value;
  const flow = cookieStore.get(REGISTER_FLOW_COOKIE)?.value ?? 'signup';

  if (!email) {
    return { error: 'Enter your email and request a verification code first.' };
  }

  try {
    const { resendRegisterOTP } = await import('@/utils/api');
    await resendRegisterOTP(email, flow as 'signup' | 'resume', await getForwardedHeaders());
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof ProfileFetchError ? err.message : 'Failed to resend verification code.',
    };
  }
}

export async function setInitialPassword(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const newPassword = String(formData.get('newPassword') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!newPassword) {
    return { error: 'Password is required.', success: false };
  }
  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.', success: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.', success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: formatUserFacingError(error.message), success: false };
  }

  await syncPasswordSetMetadata();

  return { error: null, success: true };
}
