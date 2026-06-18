export const EMAIL_OTP_MIN_LENGTH = 6;
export const EMAIL_OTP_MAX_LENGTH = 10;

export function isValidEmailOtp(value: string): boolean {
  return new RegExp(`^\\d{${EMAIL_OTP_MIN_LENGTH},${EMAIL_OTP_MAX_LENGTH}}$`).test(value.trim());
}

export function emailOtpHint(): string {
  return 'Enter the verification code we sent to your inbox.';
}

export function emailOtpInvalidMessage(): string {
  return 'Enter the verification code from your email.';
}
