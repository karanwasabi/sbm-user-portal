'use server';

import { normalizeProfileTimezoneForDb } from '@/lib/profile-timezone';
import type { MealPreference, ProfilePatch, Sex, UpdateProfileState } from '@/types/profile';
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
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const dateOfBirth = String(formData.get('dateOfBirth') ?? '').trim();
  const sex = String(formData.get('sex') ?? '').trim();
  const timezoneRaw = String(formData.get('timezoneId') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? '')
    .trim()
    .toUpperCase();
  const city = String(formData.get('city') ?? '').trim();
  const mealPreference = String(formData.get('mealPreference') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();

  const patch: ProfilePatch = {};

  if (firstName) patch.first_name = firstName;
  if (lastName) patch.last_name = lastName;
  if (dateOfBirth) patch.date_of_birth = dateOfBirth;
  if (sex) patch.sex = sex as Sex;
  if (countryCode) patch.country_code = countryCode;
  if (city) patch.city = city;
  if (mealPreference) patch.meal_preference = mealPreference as MealPreference;
  // Always include whatsapp: empty string clears the stored number.
  patch.whatsapp = whatsapp;

  if (timezoneRaw) {
    const canonical = normalizeProfileTimezoneForDb(timezoneRaw);
    if (!canonical) {
      return { error: 'Please choose a valid timezone.', success: false };
    }
    patch.timezone_id = canonical;
  }

  if (Object.keys(patch).length === 0) {
    return { error: 'No changes to save.', success: false };
  }

  try {
    await patchProfile(patch);
    return { error: null, success: true };
  } catch (error) {
    const message = error instanceof ProfileFetchError ? error.message : 'Failed to save profile.';
    return { error: message, success: false };
  }
}
