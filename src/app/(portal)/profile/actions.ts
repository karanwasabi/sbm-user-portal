'use server';

import { buildProfilePatch } from '@/lib/profile-form';
import type { ProfilePatch, UpdateProfileState } from '@/types/profile';
import type { CountryCity } from '@/types/reference';
import { fetchCountryCities, patchProfile, ProfileFetchError } from '@/utils/api';

export async function loadCountryCities(countryCode: string): Promise<CountryCity[]> {
  if (!countryCode) return [];
  try {
    return await fetchCountryCities(countryCode);
  } catch {
    return [];
  }
}

export async function updateProfile(_prevState: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const result = buildProfilePatch(formData);
  if (!result.ok) {
    return { error: result.error, success: false };
  }

  try {
    await patchProfile(result.patch);
    return { error: null, success: true };
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to save profile.';
    return { error: message, success: false };
  }
}

export async function updateNotificationPreferences(
  patch: Pick<ProfilePatch, 'notify_whatsapp' | 'notify_email' | 'notify_push'>
): Promise<UpdateProfileState> {
  if (Object.keys(patch).length === 0) {
    return { error: 'No changes to save.', success: false };
  }

  try {
    await patchProfile(patch);
    return { error: null, success: true };
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to save preferences.';
    return { error: message, success: false };
  }
}
