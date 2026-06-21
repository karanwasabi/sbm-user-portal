import type { Profile, ProfilePatch, Sex } from '@/types/profile';

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  sex: Sex | '';
  dateOfBirth: string;
  parentalConsent: boolean;
};

function isEmpty(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

export function buildMergeProfilePatch(profile: Profile | null, values: RegisterFormValues): ProfilePatch {
  const patch: ProfilePatch = {};

  if (isEmpty(profile?.first_name) && values.firstName.trim()) {
    patch.first_name = values.firstName.trim();
  }
  if (isEmpty(profile?.last_name) && values.lastName.trim()) {
    patch.last_name = values.lastName.trim();
  }
  if (isEmpty(profile?.whatsapp) && values.whatsapp.trim()) {
    patch.whatsapp = values.whatsapp.trim();
  }
  if (!profile?.sex && values.sex) {
    patch.sex = values.sex;
  }
  if (isEmpty(profile?.date_of_birth) && values.dateOfBirth.trim()) {
    patch.date_of_birth = values.dateOfBirth.trim();
    if (values.parentalConsent) {
      patch.parental_consent = true;
    }
  } else if (profile?.date_of_birth && values.parentalConsent && !profile.parental_consent) {
    patch.parental_consent = true;
  }

  return patch;
}

export function profileToRegisterDefaults(profile: Profile | null, email: string): RegisterFormValues {
  return {
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email,
    whatsapp: profile?.whatsapp ?? '',
    sex: profile?.sex ?? '',
    dateOfBirth: profile?.date_of_birth ?? '',
    parentalConsent: profile?.parental_consent ?? false,
  };
}

export function mergeRegisterDefaults(
  current: RegisterFormValues,
  profile: Profile | null,
  email: string
): RegisterFormValues {
  const fromProfile = profileToRegisterDefaults(profile, email);
  return {
    firstName: current.firstName || fromProfile.firstName,
    lastName: current.lastName || fromProfile.lastName,
    email: current.email || fromProfile.email,
    whatsapp: current.whatsapp || fromProfile.whatsapp,
    sex: current.sex || fromProfile.sex,
    dateOfBirth: current.dateOfBirth || fromProfile.dateOfBirth,
    parentalConsent: current.parentalConsent || fromProfile.parentalConsent,
  };
}
