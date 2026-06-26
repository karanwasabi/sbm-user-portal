export type RegisterStartStatus = 'otp_sent' | 'resume' | 'already_enrolled' | 'already_registered';

import type { RegisterField, RegisterFieldErrors } from '@/lib/register-form-validation';

export type { RegisterField, RegisterFieldErrors };

export type RegisterStartResponse = {
  status: RegisterStartStatus;
  email: string;
};

export type RegisterStartInput = {
  email: string;
  first_name: string;
  last_name: string;
  whatsapp: string;
  sex: string;
  date_of_birth: string;
  parental_consent: boolean;
  dpdp_consent: boolean;
};

export type RegisterVerifyState = {
  error: string | null;
  verified: boolean;
};

export type RegisterStartState = {
  error: string | null;
  fieldErrors?: RegisterFieldErrors;
  focusField?: RegisterField;
  status: RegisterStartStatus | null;
  email: string | null;
};

export const REGISTER_EMAIL_COOKIE = 'sbm_register_email';
export const REGISTER_DRAFT_COOKIE = 'sbm_register_draft';

export type RegisterDraft = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  /** Dial-country ISO from the picker (needed for shared codes like +1). */
  whatsappDialIso?: string;
  sex: string;
  dateOfBirth: string;
  parentalConsent: boolean;
  dpdpConsent: boolean;
};
