import type { Profile } from '@/types/profile';

export type ProfileCompletionField = 'sex' | 'timezone' | 'country' | 'city' | 'meal_preference';

const FIELD_LABELS: Record<ProfileCompletionField, string> = {
  sex: 'Sex',
  timezone: 'Timezone',
  country: 'Country',
  city: 'City',
  meal_preference: 'Meal preference',
};

export function getMissingProfileFields(profile: Profile | null): ProfileCompletionField[] {
  if (!profile) return ['sex', 'timezone', 'country', 'city', 'meal_preference'];

  const missing: ProfileCompletionField[] = [];
  if (!profile.sex) missing.push('sex');
  if (!profile.timezone_id?.trim()) missing.push('timezone');
  if (!profile.country_code?.trim()) missing.push('country');
  if (!profile.city?.trim()) missing.push('city');
  if (!profile.meal_preference) missing.push('meal_preference');
  return missing;
}

export function isProfileFullyComplete(profile: Profile | null): boolean {
  return getMissingProfileFields(profile).length === 0;
}

export function getProfileCompletionSummary(profile: Profile | null): {
  missing: ProfileCompletionField[];
  missingLabels: string[];
  isComplete: boolean;
} {
  const missing = getMissingProfileFields(profile);
  return {
    missing,
    missingLabels: missing.map((field) => FIELD_LABELS[field]),
    isComplete: missing.length === 0,
  };
}
