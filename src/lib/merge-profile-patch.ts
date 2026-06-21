import type { Profile, ProfilePatch, Sex } from '@/types/profile';
import type { RegisterDraft } from '@/types/register';

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

export function buildRegisterProfilePatch(values: RegisterFormValues): ProfilePatch {
  const patch: ProfilePatch = {};

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const whatsapp = values.whatsapp.trim();
  const dateOfBirth = values.dateOfBirth.trim();

  if (firstName) patch.first_name = firstName;
  if (lastName) patch.last_name = lastName;
  if (whatsapp) patch.whatsapp = whatsapp;
  if (values.sex) patch.sex = values.sex;
  if (dateOfBirth) {
    patch.date_of_birth = dateOfBirth;
    patch.parental_consent = values.parentalConsent;
  }

  return patch;
}

export function registerDraftFromValues(values: RegisterFormValues & { dpdpConsent: boolean }): RegisterDraft {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    whatsapp: values.whatsapp,
    sex: values.sex,
    dateOfBirth: values.dateOfBirth,
    parentalConsent: values.parentalConsent,
    dpdpConsent: values.dpdpConsent,
  };
}

export function registerDraftToFormValues(draft: RegisterDraft): RegisterFormValues {
  return {
    firstName: draft.firstName,
    lastName: draft.lastName,
    email: draft.email,
    whatsapp: draft.whatsapp,
    sex: (draft.sex || '') as RegisterFormValues['sex'],
    dateOfBirth: draft.dateOfBirth,
    parentalConsent: draft.parentalConsent,
  };
}

export function parseRegisterDraft(raw: string | undefined): RegisterDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RegisterDraft>;
    if (typeof parsed.email !== 'string') return null;
    return {
      firstName: String(parsed.firstName ?? ''),
      lastName: String(parsed.lastName ?? ''),
      email: String(parsed.email ?? '')
        .trim()
        .toLowerCase(),
      whatsapp: String(parsed.whatsapp ?? ''),
      sex: String(parsed.sex ?? ''),
      dateOfBirth: String(parsed.dateOfBirth ?? ''),
      parentalConsent: parsed.parentalConsent === true,
      dpdpConsent: parsed.dpdpConsent === true,
    };
  } catch {
    return null;
  }
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
