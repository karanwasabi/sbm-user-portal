import { shouldShowParentalConsent } from '@/lib/date-of-birth';
import type { Profile } from '@/types/profile';

export type OnboardingStep = 1 | 2;

export function isOnboardingComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.first_name?.trim()) return false;
  if (!profile.date_of_birth) return false;
  if (shouldShowParentalConsent(profile.date_of_birth) && !profile.parental_consent) return false;
  if (!profile.whatsapp?.trim()) return false;
  return true;
}

export function getOnboardingStep(profile: Profile | null): OnboardingStep {
  if (!profile?.first_name?.trim() || !profile.date_of_birth) return 1;
  if (shouldShowParentalConsent(profile.date_of_birth) && !profile.parental_consent) return 1;
  return 2;
}

export function getPostAuthRedirectPath(profile: Profile | null): '/onboarding' | '/' {
  return isOnboardingComplete(profile) ? '/' : '/onboarding';
}
