import { getMobileDigitLimits, validateMobileNational } from '@/lib/country-mobile-rules';
import { isParentalConsentValidationError, validateDateOfBirth } from '@/lib/date-of-birth';
import { isValidEmailFormat } from '@/lib/email-validation';
import type { RegisterFormValues } from '@/lib/merge-profile-patch';
import { parseWhatsapp } from '@/lib/phone-number';
import { SEX_OPTIONS } from '@/types/profile';

export type RegisterField =
  | 'firstName'
  | 'email'
  | 'whatsapp'
  | 'sex'
  | 'dateOfBirth'
  | 'parentalConsent'
  | 'dpdpConsent';

export type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

export type RegisterFormInput = RegisterFormValues & { dpdpConsent: boolean };

const VALID_SEX = new Set(SEX_OPTIONS.map((option) => option.value));

const FIELD_ORDER: RegisterField[] = [
  'firstName',
  'email',
  'sex',
  'whatsapp',
  'dateOfBirth',
  'parentalConsent',
  'dpdpConsent',
];

function validateWhatsapp(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'WhatsApp number is required.';

  const parsed = parseWhatsapp(trimmed);
  if (!parsed.dialIso) return 'Select a country code.';
  if (!parsed.nationalNumber) return 'WhatsApp number is required.';

  const limits = getMobileDigitLimits(parsed.dialIso);
  if (parsed.nationalNumber.length < limits.min) {
    return 'WhatsApp number is required.';
  }

  return validateMobileNational(parsed.nationalNumber, parsed.dialIso);
}

export function validateRegisterForm(values: RegisterFormInput): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmailFormat(values.email)) {
    errors.email = "That doesn't look like a valid email.";
  }

  if (!values.sex || !VALID_SEX.has(values.sex)) {
    errors.sex = 'Sex is required.';
  }

  if (!values.dateOfBirth.trim()) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const dobError = validateDateOfBirth(values.dateOfBirth, values.parentalConsent);
    if (dobError) {
      if (isParentalConsentValidationError(dobError)) {
        errors.parentalConsent = dobError;
      } else {
        errors.dateOfBirth = dobError;
      }
    }
  }

  const whatsappError = validateWhatsapp(values.whatsapp);
  if (whatsappError) {
    errors.whatsapp = whatsappError;
  }

  if (!values.dpdpConsent) {
    errors.dpdpConsent = 'You must accept the Terms and Privacy Policy to continue.';
  }

  return errors;
}

export function firstRegisterFieldError(errors: RegisterFieldErrors): RegisterField | undefined {
  return FIELD_ORDER.find((field) => errors[field]);
}
