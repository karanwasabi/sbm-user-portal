import type { AuthStepDefinition } from '@/components/auth/auth-step-indicator';

export const ONBOARDING_STEPS: AuthStepDefinition[] = [
  { step: 1, label: 'About you' },
  { step: 2, label: 'Contact' },
];

/** Temporary testing value — restore to 60 before release. */
export const OTP_RESEND_COOLDOWN_SECONDS = 5;
