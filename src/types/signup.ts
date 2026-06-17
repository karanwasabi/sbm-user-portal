export type SignupAccountField = 'email' | 'password' | 'confirmPassword' | 'dpdpConsent';

export type CreateAccountState = {
  error: string | null;
  success: boolean;
  focusField?: SignupAccountField;
  errorFields?: SignupAccountField[];
};

export type VerifyEmailState = {
  error: string | null;
  success: boolean;
};

export type ResendOtpState = {
  error: string | null;
  success: boolean;
};

export type CompleteOnboardingState = {
  error: string | null;
  success: boolean;
};

export const SIGNUP_EMAIL_COOKIE = 'sbm_signup_email';
export const PENDING_DPDP_COOKIE = 'sbm_pending_dpdp';
