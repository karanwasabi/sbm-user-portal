import { describe, expect, it } from 'vitest';

import {
  isBlockedCategory,
  isNewUserCategory,
  isRenewal1mAutopayPlan,
  isSubscribedProfileFieldLocked,
  isTrialPlanOptionsLoading,
  shouldClearPromoForPlan,
} from '@/components/renew/renew-page-helpers';

describe('renew-page-helpers', () => {
  it('identifies new-user categories', () => {
    expect(isNewUserCategory('new_user')).toBe(true);
    expect(isNewUserCategory('new_lead_no_sub')).toBe(true);
    expect(isNewUserCategory('returnee_no_sub')).toBe(false);
  });

  it('identifies blocked auto-renew categories', () => {
    expect(isBlockedCategory('member_auto_renew')).toBe(true);
    expect(isBlockedCategory('trial_extend')).toBe(false);
  });

  it('locks subscribed lead profile fields only when prefilled', () => {
    expect(isSubscribedProfileFieldLocked('member_manual_renew', 'Jane')).toBe(true);
    expect(isSubscribedProfileFieldLocked('member_manual_renew', '')).toBe(false);
    expect(isSubscribedProfileFieldLocked('new_user', 'Jane')).toBe(false);
  });

  it('clears promo when leaving trial_3m', () => {
    expect(shouldClearPromoForPlan('trial_3m')).toBe(false);
    expect(shouldClearPromoForPlan('trial_1m')).toBe(true);
  });

  it('detects trial plan loading state', () => {
    expect(isTrialPlanOptionsLoading('new_user', 2, 0)).toBe(true);
    expect(isTrialPlanOptionsLoading('new_user', 2, 2)).toBe(false);
    expect(isTrialPlanOptionsLoading('returnee_no_sub', 2, 0)).toBe(false);
  });

  it('detects returnee 1-month autopay plan', () => {
    expect(isRenewal1mAutopayPlan('returnee_no_sub', 'renewal_1m')).toBe(true);
    expect(isRenewal1mAutopayPlan('returnee_no_sub', 'renewal_3m')).toBe(false);
    expect(isRenewal1mAutopayPlan('newbie_manual_renew', 'renewal_1m')).toBe(false);
  });
});
