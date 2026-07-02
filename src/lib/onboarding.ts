import { shouldShowParentalConsent } from '@/lib/date-of-birth';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import { hasPendingPayment, type Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';

export type OnboardingStep = 1 | 2;

export function isProfileOnboardingComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.first_name?.trim()) return false;
  if (!profile.last_name?.trim()) return false;
  if (!profile.date_of_birth) return false;
  if (shouldShowParentalConsent(profile.date_of_birth) && !profile.parental_consent) return false;
  if (!profile.whatsapp?.trim()) return false;
  return true;
}

export function isEnrolled(enrollments: Enrollment[]): boolean {
  return enrollments.some((entry) => entry.status === 'active' || entry.status === 'upcoming');
}

/** Enrolled members keep portal access even if they later clear onboarding fields (e.g. WhatsApp). */
export function hasPortalAccess(profile: Profile | null, enrollments: Enrollment[] = []): boolean {
  if (!profile) return false;
  return isEnrolled(enrollments) || hasPendingPayment(enrollments);
}

export function needsPayment(enrollments: Enrollment[]): boolean {
  return !isEnrolled(enrollments) && hasPendingPayment(enrollments);
}

export function isOnboardingComplete(profile: Profile | null, enrollments: Enrollment[] = []): boolean {
  return isProfileOnboardingComplete(profile) && isEnrolled(enrollments);
}

export function getOnboardingStep(profile: Profile | null, enrollments: Enrollment[] = []): OnboardingStep {
  if (!isProfileOnboardingComplete(profile)) return 1;
  if (!isEnrolled(enrollments)) return 2;
  return 2;
}

export function getPostAuthRedirectPath(
  profile: Profile | null,
  enrollments: Enrollment[] = []
): '/register' | typeof PORTAL_HOME_PATH {
  return hasPortalAccess(profile, enrollments) || isOnboardingComplete(profile, enrollments)
    ? PORTAL_HOME_PATH
    : '/register';
}
