'use server';

import { buildProfilePatch } from '@/lib/profile-form';
import { MIN_PASSWORD_LENGTH } from '@/lib/password-requirements';
import type { CreateAccountState, CompleteRegistrationState } from '@/types/signup';
import type { Country } from '@/types/reference';
import { fetchCountries, patchProfile, ProfileFetchError } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export async function createAccount(_prevState: CreateAccountState, formData: FormData): Promise<CreateAccountState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  const errorFields: CreateAccountState['errorFields'] = [];

  if (!email) errorFields.push('email');
  if (!password) errorFields.push('password');
  if (!confirmPassword) errorFields.push('confirmPassword');

  if (errorFields.length > 0) {
    return {
      error: 'All fields are required.',
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const message = error.message.toLowerCase().includes('already registered')
      ? 'An account with this email already exists. Try signing in instead.'
      : error.message;

    return {
      error: message,
      success: false,
      focusField: 'email',
      errorFields: ['email'],
    };
  }

  return { error: null, success: true };
}

export async function loadSignupCountries(): Promise<Country[]> {
  try {
    return await fetchCountries();
  } catch {
    return [];
  }
}

export async function completeRegistration(
  _prevState: CompleteRegistrationState,
  formData: FormData
): Promise<CompleteRegistrationState> {
  const result = buildProfilePatch(formData, { requireAll: true });
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
