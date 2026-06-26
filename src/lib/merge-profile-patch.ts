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

export function registerDraftFromValues(
  values: RegisterFormValues & { dpdpConsent: boolean; whatsappDialIso?: string }
): RegisterDraft {
  const whatsappDialIso = values.whatsappDialIso?.trim().toUpperCase();
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    whatsapp: values.whatsapp,
    whatsappDialIso: whatsappDialIso || undefined,
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
      whatsappDialIso:
        String(parsed.whatsappDialIso ?? '')
          .trim()
          .toUpperCase() || undefined,
      sex: String(parsed.sex ?? ''),
      dateOfBirth: String(parsed.dateOfBirth ?? ''),
      parentalConsent: parsed.parentalConsent === true,
      dpdpConsent: parsed.dpdpConsent === true,
    };
  } catch {
    return null;
  }
}

export function profileToRegisterDefaults(
  profile: Profile | null,
  email: string,
  legalName?: string | null
): RegisterFormValues {
  const fromLegal = splitLegalName(legalName);
  return {
    firstName: profile?.first_name?.trim() || fromLegal.firstName,
    lastName: profile?.last_name?.trim() || fromLegal.lastName,
    email,
    whatsapp: profile?.whatsapp ?? '',
    sex: profile?.sex ?? '',
    dateOfBirth: profile?.date_of_birth ?? '',
    parentalConsent: profile?.parental_consent ?? false,
  };
}

function splitLegalName(legalName: string | null | undefined): { firstName: string; lastName: string } {
  const trimmed = legalName?.trim() ?? '';
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function mergeRegisterDefaults(
  current: RegisterFormValues,
  profile: Profile | null,
  email: string,
  legalName?: string | null
): RegisterFormValues {
  const fromProfile = profileToRegisterDefaults(profile, email, legalName);
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
