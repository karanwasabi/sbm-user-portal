import { validateDateOfBirth } from '@/lib/date-of-birth';
import type { MealPreference, Profile, Sex } from '@/types/profile';

export type ProfileCompletionField =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'date_of_birth'
  | 'sex'
  | 'meal_preference'
  | 'country'
  | 'city'
  | 'whatsapp'
  | 'timezone';

const PROFILE_COMPLETION_FIELD_COUNT = 10;

const ALL_PROFILE_COMPLETION_FIELDS: ProfileCompletionField[] = [
  'first_name',
  'last_name',
  'email',
  'date_of_birth',
  'sex',
  'meal_preference',
  'country',
  'city',
  'whatsapp',
  'timezone',
];

const FIELD_LABELS: Record<ProfileCompletionField, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  date_of_birth: 'Date of birth',
  sex: 'Sex',
  meal_preference: 'Meal preference',
  country: 'Country',
  city: 'City',
  whatsapp: 'Mobile (WhatsApp)',
  timezone: 'Timezone',
};

export type ProfileCompletionValues = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  sex?: Sex | '' | null;
  timezone_id?: string | null;
  country_code?: string | null;
  city?: string | null;
  meal_preference?: MealPreference | '' | null;
  whatsapp?: string | null;
  parental_consent?: boolean;
};

function isDateOfBirthComplete(dateOfBirth: string | null | undefined, parentalConsent: boolean): boolean {
  if (!dateOfBirth?.trim()) return false;
  return validateDateOfBirth(dateOfBirth, parentalConsent) === null;
}

function getMissingFieldsFromValues(values: ProfileCompletionValues): ProfileCompletionField[] {
  const missing: ProfileCompletionField[] = [];
  const parentalConsent = values.parental_consent ?? false;

  if (!values.first_name?.trim()) missing.push('first_name');
  if (!values.last_name?.trim()) missing.push('last_name');
  if (!values.email?.trim()) missing.push('email');
  if (!isDateOfBirthComplete(values.date_of_birth, parentalConsent)) missing.push('date_of_birth');
  if (!values.sex) missing.push('sex');
  if (!values.meal_preference) missing.push('meal_preference');
  if (!values.country_code?.trim()) missing.push('country');
  if (!values.city?.trim()) missing.push('city');
  if (!values.whatsapp?.trim()) missing.push('whatsapp');
  if (!values.timezone_id?.trim()) missing.push('timezone');

  return missing;
}

export function getMissingProfileFields(profile: Profile | null): ProfileCompletionField[] {
  if (!profile) return ALL_PROFILE_COMPLETION_FIELDS;

  return getMissingFieldsFromValues({
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    date_of_birth: profile.date_of_birth,
    sex: profile.sex,
    timezone_id: profile.timezone_id,
    country_code: profile.country_code,
    city: profile.city,
    meal_preference: profile.meal_preference,
    whatsapp: profile.whatsapp,
    parental_consent: profile.parental_consent,
  });
}

export function getProfileCompletionPercent(profile: Profile | null): number {
  const missing = getMissingProfileFields(profile).length;
  return Math.round(((PROFILE_COMPLETION_FIELD_COUNT - missing) / PROFILE_COMPLETION_FIELD_COUNT) * 100);
}

export function getProfileCompletionPercentFromValues(values: ProfileCompletionValues): number {
  const missing = getMissingFieldsFromValues(values).length;
  return Math.round(((PROFILE_COMPLETION_FIELD_COUNT - missing) / PROFILE_COMPLETION_FIELD_COUNT) * 100);
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
