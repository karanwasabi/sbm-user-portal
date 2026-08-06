import type { RenewCategory } from '@/types/renew';

export function isNewUserCategory(category: RenewCategory | null) {
  return category === 'new_user' || category === 'new_lead_no_sub';
}

export function isBlockedCategory(category: RenewCategory | null) {
  return category === 'newbie_auto_renew' || category === 'member_auto_renew';
}

export function isSubscribedLeadCategory(category: RenewCategory | null) {
  if (!category) return false;
  return !isNewUserCategory(category) && category !== 'returnee_no_sub';
}

export function isSubscribedProfileFieldLocked(category: RenewCategory | null, prefilledValue?: string) {
  return isSubscribedLeadCategory(category) && Boolean(prefilledValue?.trim());
}

/** Promo codes only apply to the 3-month trial on new-user paths. */
export function shouldClearPromoForPlan(planKey: string) {
  return planKey !== 'trial_3m';
}

/** Returnee 1-month plan uses Razorpay subscription autopay. */
export function isRenewal1mAutopayPlan(category: RenewCategory | null, planKey: string) {
  return (category === 'returnee_no_sub' || category === 'old_student_active_renew') && planKey === 'renewal_1m';
}

export function isTrialPlanOptionsLoading(
  category: RenewCategory | null,
  trialProductCount: number,
  planPickerOptionCount: number
) {
  return isNewUserCategory(category) && trialProductCount > 0 && planPickerOptionCount < trialProductCount;
}
