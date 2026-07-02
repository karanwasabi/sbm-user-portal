'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasProduct, PRODUCT_MEMBER_PORTAL } from '@/lib/access';
import { emailOtpInvalidMessage, isValidEmailOtp } from '@/lib/email-otp';
import { formatUserFacingError } from '@/lib/format-user-error';
import { LOGIN_PRODUCT_MEMBER_PORTAL, MEMBER_PORTAL_LOGIN_DENIED_MESSAGE } from '@/lib/login-access';
import { getMyAccess } from '@/utils/access-api';
import { ProfileFetchError, sendLoginOTP } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContinuePaymentFocusField = 'email' | 'otp';

export type ContinuePaymentState = {
  error: string | null;
  focusField?: ContinuePaymentFocusField;
  errorFields?: ContinuePaymentFocusField[];
};

export type SendContinuePaymentOtpState = {
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

async function rejectWithoutMemberPortalAccess(
  supabase: SupabaseClient,
  focusField: ContinuePaymentFocusField
): Promise<ContinuePaymentState> {
  await supabase.auth.signOut();
  const errorFields: ContinuePaymentFocusField[] = focusField === 'otp' ? ['email', 'otp'] : ['email'];
  return {
    error: MEMBER_PORTAL_LOGIN_DENIED_MESSAGE,
    focusField,
    errorFields,
  };
}

async function ensureMemberPortalAccess(
  supabase: SupabaseClient,
  focusField: ContinuePaymentFocusField
): Promise<ContinuePaymentState | null> {
  try {
    const access = await getMyAccess();
    if (!hasProduct(access.products, PRODUCT_MEMBER_PORTAL)) {
      return rejectWithoutMemberPortalAccess(supabase, focusField);
    }
  } catch {
    return rejectWithoutMemberPortalAccess(supabase, focusField);
  }
  return null;
}

export async function sendContinuePaymentOtp(
  _prevState: SendContinuePaymentOtpState,
  formData: FormData
): Promise<SendContinuePaymentOtpState> {
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

export async function verifyContinuePaymentOtp(
  _prevState: ContinuePaymentState,
  formData: FormData
): Promise<ContinuePaymentState> {
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

  const denied = await ensureMemberPortalAccess(supabase, 'otp');
  if (denied) return denied;

  redirect('/register?verified=1');
}

export async function resendContinuePaymentOtp(email: string): Promise<{ error: string | null }> {
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
