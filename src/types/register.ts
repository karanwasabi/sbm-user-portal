export type RegisterStartStatus = 'otp_sent' | 'resume' | 'already_enrolled';

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
  status: RegisterStartStatus | null;
  email: string | null;
};

export const REGISTER_EMAIL_COOKIE = 'sbm_register_email';
