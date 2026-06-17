import type { AuthStepDefinition } from '@/components/auth/auth-step-indicator';

export const ONBOARDING_STEPS: AuthStepDefinition[] = [
  { step: 1, label: 'About you' },
  { step: 2, label: 'Join program' },
];

/** Matches Supabase auth email max_frequency (60s). */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
