'use server';

import { redirect } from 'next/navigation';
import { getPostAuthRedirectPath } from '@/lib/onboarding';
import { formatUserFacingError } from '@/lib/format-user-error';
import { getLatestProfile, ProfileFetchError } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export type LoginFocusField = 'email' | 'password';

export type LoginState = {
  error: string | null;
  focusField?: LoginFocusField;
  errorFields?: LoginFocusField[];
};

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
    redirect(`/signup/verify?email=${encodeURIComponent(email.toLowerCase())}`);
  }

  let profile = null;
  try {
    profile = await getLatestProfile();
  } catch (loadError) {
    if (!(loadError instanceof ProfileFetchError && loadError.status === 404)) {
      redirect('/onboarding');
    }
  }

  redirect(getPostAuthRedirectPath(profile));
}
