'use server';

import { patchProfile, ProfileFetchError } from '@/utils/api';
import { buildProfilePatch } from '@/lib/profile-form';
import type { CompleteOnboardingState } from '@/types/onboarding';

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
