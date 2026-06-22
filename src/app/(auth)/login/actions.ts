'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasProduct, PRODUCT_MEMBER_PORTAL } from '@/lib/access';
import { emailOtpInvalidMessage, isValidEmailOtp } from '@/lib/email-otp';
import { formatUserFacingError } from '@/lib/format-user-error';
import { LOGIN_PRODUCT_MEMBER_PORTAL, MEMBER_PORTAL_LOGIN_DENIED_MESSAGE } from '@/lib/login-access';
import { getPostAuthRedirectPath } from '@/lib/onboarding';
import { getMyAccess } from '@/utils/access-api';
import { getLatestProfile, getMyEnrollments, ProfileFetchError, sendLoginOTP } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export type LoginFocusField = 'email' | 'password' | 'otp';

export type LoginState = {
  error: string | null;
  focusField?: LoginFocusField;
  errorFields?: LoginFocusField[];
};

export type SendLoginOtpState = {
  error: string | null;
  sent: boolean;
  email: string | null;
  focusField?: 'email';
};

async function getForwardedHeaders(): Promise<HeadersInit> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const out: Record<string, string> = {};
  if (forwarded) out['X-Forwarded-For'] = forwarded;
  if (realIp) out['X-Real-IP'] = realIp;
  return out;
}

async function rejectLoginWithoutMemberPortalAccess(
  supabase: SupabaseClient,
  focusField: LoginFocusField
): Promise<LoginState> {
  await supabase.auth.signOut();
  const errorFields: LoginFocusField[] = focusField === 'otp' ? ['email', 'otp'] : ['email', 'password'];
  return {
    error: MEMBER_PORTAL_LOGIN_DENIED_MESSAGE,
    focusField,
    errorFields,
  };
}

async function ensureMemberPortalLoginAccess(
  supabase: SupabaseClient,
  focusField: LoginFocusField
): Promise<LoginState | null> {
  try {
    const access = await getMyAccess();
    if (!hasProduct(access.products, PRODUCT_MEMBER_PORTAL)) {
      return rejectLoginWithoutMemberPortalAccess(supabase, focusField);
    }
  } catch {
    return rejectLoginWithoutMemberPortalAccess(supabase, focusField);
  }
  return null;
}

async function redirectAfterAuthenticatedLogin(): Promise<never> {
  let profile = null;
  let enrollments: Awaited<ReturnType<typeof getMyEnrollments>> = [];
  try {
    profile = await getLatestProfile();
    enrollments = await getMyEnrollments();
  } catch (loadError) {
    if (!(loadError instanceof ProfileFetchError && loadError.status === 404)) {
      redirect('/onboarding');
    }
  }

  redirect(getPostAuthRedirectPath(profile, enrollments));
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email && !password) {
    return {
      error: 'Email and password are required.',
      focusField: 'email',
      errorFields: ['email', 'password'],
    };
  }

  if (!email) {
    return { error: 'Email is required.', focusField: 'email', errorFields: ['email'] };
  }

  if (!password) {
    return { error: 'Password is required.', focusField: 'password', errorFields: ['password'] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase().includes('email not confirmed')
      ? 'Please verify your email before signing in. Check your inbox for the verification code.'
      : error.message;
    return { error: formatUserFacingError(message), focusField: 'password', errorFields: ['email', 'password'] };
  }

  if (!data.user?.email_confirmed_at) {
    redirect('/register');
  }

  const denied = await ensureMemberPortalLoginAccess(supabase, 'password');
  if (denied) return denied;

  return await redirectAfterAuthenticatedLogin();
}

export async function sendLoginOtp(_prevState: SendLoginOtpState, formData: FormData): Promise<SendLoginOtpState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: 'Email is required.', sent: false, email: null, focusField: 'email' };
  }

  try {
    await sendLoginOTP(email, LOGIN_PRODUCT_MEMBER_PORTAL, await getForwardedHeaders());
    return { error: null, sent: true, email };
  } catch (err) {
    const message = err instanceof ProfileFetchError ? err.message : 'Failed to send OTP.';
    return { error: message, sent: false, email: null, focusField: 'email' };
  }
}

export async function verifyLoginOtp(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const token = String(formData.get('otp') ?? '').trim();

  if (!email) {
    return { error: 'Email is required.', focusField: 'email', errorFields: ['email'] };
  }

  if (!isValidEmailOtp(token)) {
    return { error: emailOtpInvalidMessage(), focusField: 'otp', errorFields: ['otp'] };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) {
    return { error: formatUserFacingError(error.message), focusField: 'otp', errorFields: ['otp'] };
  }

  const denied = await ensureMemberPortalLoginAccess(supabase, 'otp');
  if (denied) return denied;

  return await redirectAfterAuthenticatedLogin();
}

export async function resendLoginOtp(email: string): Promise<{ error: string | null }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: 'Email is required.' };
  }

  try {
    await sendLoginOTP(normalizedEmail, LOGIN_PRODUCT_MEMBER_PORTAL, await getForwardedHeaders());
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof ProfileFetchError ? err.message : 'Failed to resend OTP.',
    };
  }
}
