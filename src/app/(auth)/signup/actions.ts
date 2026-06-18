'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { completeSignupVerification } from '@/lib/complete-signup-verification';
import { MIN_PASSWORD_LENGTH } from '@/lib/password-requirements';
import type {
  CompleteOnboardingState,
  CreateAccountState,
  EnrollState,
  ResendOtpState,
  VerifyEmailState,
} from '@/types/signup';
import { PENDING_DPDP_COOKIE, SIGNUP_EMAIL_COOKIE } from '@/types/signup';
import { patchProfile, ProfileFetchError, registerSignup, resendSignupOTP, enrollInProgram } from '@/utils/api';
import { buildProfilePatch } from '@/lib/profile-form';
import { emailOtpInvalidMessage, isValidEmailOtp } from '@/lib/email-otp';
import { formatUserFacingError } from '@/lib/format-user-error';
import { createClient } from '@/utils/supabase/server';

const SIGNUP_COOKIE_MAX_AGE = 60 * 60;

async function clientIpHeader(): Promise<HeadersInit> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const result: Record<string, string> = {};
  if (forwarded) result['X-Forwarded-For'] = forwarded;
  if (realIp) result['X-Real-IP'] = realIp;
  return result;
}

export async function createAccount(_prevState: CreateAccountState, formData: FormData): Promise<CreateAccountState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const dpdpConsent = formData.get('dpdpConsent') === 'true';

  const errorFields: CreateAccountState['errorFields'] = [];

  if (!email) errorFields.push('email');
  if (!password) errorFields.push('password');
  if (!confirmPassword) errorFields.push('confirmPassword');
  if (!dpdpConsent) errorFields.push('dpdpConsent');

  if (errorFields.length > 0) {
    return {
      error: dpdpConsent
        ? 'All fields are required.'
        : 'You must accept the Terms and Privacy Policy to create an account.',
      success: false,
      focusField: errorFields[0],
      errorFields,
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      success: false,
      focusField: 'password',
      errorFields: ['password'],
    };
  }

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match.',
      success: false,
      focusField: 'confirmPassword',
      errorFields: ['confirmPassword'],
    };
  }

  try {
    await registerSignup(email, password, await clientIpHeader());
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to create account. Please try again.';
    return {
      error: message,
      success: false,
      focusField: 'email',
      errorFields: ['email'],
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SIGNUP_EMAIL_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SIGNUP_COOKIE_MAX_AGE,
    path: '/',
  });
  if (dpdpConsent) {
    cookieStore.set(PENDING_DPDP_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SIGNUP_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  redirect('/signup/verify');
}

export async function verifyEmailOtp(_prevState: VerifyEmailState, formData: FormData): Promise<VerifyEmailState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const token = String(formData.get('otp') ?? '').trim();

  if (!email || !token) {
    return { error: 'Email and verification code are required.', success: false };
  }

  if (!isValidEmailOtp(token)) {
    return { error: emailOtpInvalidMessage(), success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });

  if (error) {
    return { error: formatUserFacingError(error.message), success: false };
  }

  const completion = await completeSignupVerification();
  if (completion.error) {
    return { error: completion.error, success: false };
  }

  return { error: null, success: true };
}

/** Clears signup cookies, ends any partial session, and returns to account creation. */
export async function restartSignup(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SIGNUP_EMAIL_COOKIE);
  cookieStore.delete(PENDING_DPDP_COOKIE);

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect('/signup');
}

export async function resendEmailOtp(_prevState: ResendOtpState, formData: FormData): Promise<ResendOtpState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: 'Email is required to resend the verification code.', success: false };
  }

  try {
    await resendSignupOTP(email, await clientIpHeader());
  } catch (error) {
    const message =
      error instanceof ProfileFetchError ? error.message : 'Failed to resend verification code. Please try again.';
    return { error: message, success: false };
  }

  return { error: null, success: true };
}

export async function completeOnboarding(
  _prevState: CompleteOnboardingState,
  formData: FormData
): Promise<CompleteOnboardingState> {
  const result = buildProfilePatch(formData, { requireOnboarding: true });
  if (!result.ok) {
    return { error: result.error, success: false };
  }

  try {
    await patchProfile(result.patch);
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to save your profile.';
    return { error: message, success: false };
  }

  return { error: null, success: true };
}

export async function enrollInTakeControl(_prevState: EnrollState): Promise<EnrollState> {
  try {
    await enrollInProgram('take-control');
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to enroll. Please try again.';
    return { error: message, success: false };
  }

  return { error: null, success: true };
}
