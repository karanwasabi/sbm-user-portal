export type SignupAccountField = 'email' | 'password' | 'confirmPassword' | 'dpdpConsent';

export type SignupStep = 1 | 2 | 3 | 4;

export type CreateAccountState = {
  error: string | null;
  success: boolean;
  focusField?: SignupAccountField;
  errorFields?: SignupAccountField[];
};

export type CompleteRegistrationState = {
  error: string | null;
  success: boolean;
};

export const SIGNUP_STEPS: { step: SignupStep; label: string }[] = [
  { step: 1, label: 'Account' },
  { step: 2, label: 'About you' },
  { step: 3, label: 'Location' },
  { step: 4, label: 'Program' },
];
