import type { RenewCategory, RenewCheckoutPreview } from '@/types/renew';

const TRIAL_EXTEND_BASE_PLAN_KEY = 'trial_extend_2m';

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

/** Renew categories where renewal_1m is a Razorpay subscription with autopay. */
export const RENEW_1M_AUTOPAY_CATEGORIES: RenewCategory[] = ['returnee_no_sub', 'old_student_active_renew'];

export function isRenew1mAutopayCategory(category: RenewCategory | null): boolean {
  return category != null && RENEW_1M_AUTOPAY_CATEGORIES.includes(category);
}

/** 1-month renewal plan uses Razorpay subscription autopay for returnees and active old-students. */
export function isRenewal1mAutopayPlan(category: RenewCategory | null, planKey: string) {
  return isRenew1mAutopayCategory(category) && planKey.trim() === 'renewal_1m';
}

export function isTrialPlanOptionsLoading(
  category: RenewCategory | null,
  trialProductCount: number,
  planPickerOptionCount: number
) {
  return isNewUserCategory(category) && trialProductCount > 0 && planPickerOptionCount < trialProductCount;
}

/** Pretax base for the standalone 2-month trial extension (₹6,300 domestic). */
export function trialExtendExtensionBasePaise(plans: RenewCheckoutPreview['plans'], countryIso: string): number | null {
  const extensionPlan = plans?.find((plan) => plan.plan_key === TRIAL_EXTEND_BASE_PLAN_KEY);
  if (!extensionPlan) return null;
  return countryIso === 'IN' ? extensionPlan.domestic.base_paise : extensionPlan.international.base_paise;
}

export function trialExtendAddonBasePaise(totalBasePaise: number, extensionBasePaise: number | null): number | null {
  if (extensionBasePaise == null || totalBasePaise <= extensionBasePaise) return null;
  return totalBasePaise - extensionBasePaise;
}
