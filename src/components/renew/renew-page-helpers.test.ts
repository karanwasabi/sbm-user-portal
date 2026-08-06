import { describe, expect, it } from 'vitest';

import {
  isBlockedCategory,
  isNewUserCategory,
  isRenewal1mAutopayPlan,
  isSubscribedProfileFieldLocked,
  isTrialPlanOptionsLoading,
  shouldClearPromoForPlan,
  trialExtendAddonBasePaise,
  trialExtendExtensionBasePaise,
} from '@/components/renew/renew-page-helpers';
import type { RenewCheckoutPreview } from '@/types/renew';

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
    expect(isRenewal1mAutopayPlan('old_student_active_renew', 'renewal_1m')).toBe(true);
    expect(isRenewal1mAutopayPlan('returnee_no_sub', 'renewal_3m')).toBe(false);
    expect(isRenewal1mAutopayPlan('newbie_manual_renew', 'renewal_1m')).toBe(false);
  });

  it('splits trial extend pretax into extension and addon amounts', () => {
    const plans: RenewCheckoutPreview['plans'] = [
      {
        plan_key: 'trial_extend_2m',
        domestic: {
          plan_key: 'trial_extend_2m',
          pricing_region: 'domestic',
          base_paise: 630_000,
          gst_paise: 113_400,
          total_paise: 743_400,
          currency: 'INR',
          trial_months_bump: 2,
        },
        international: {
          plan_key: 'trial_extend_2m',
          pricing_region: 'international',
          base_paise: 913_500,
          gst_paise: 0,
          total_paise: 913_500,
          currency: 'INR',
          trial_months_bump: 2,
        },
      },
      {
        plan_key: 'trial_extend_2m_3m',
        domestic: {
          plan_key: 'trial_extend_2m_3m',
          pricing_region: 'domestic',
          base_paise: 1_029_900,
          gst_paise: 185_382,
          total_paise: 1_215_282,
          currency: 'INR',
          trial_months_bump: 2,
          renewal_months: 3,
        },
        international: {
          plan_key: 'trial_extend_2m_3m',
          pricing_region: 'international',
          base_paise: 1_490_535,
          gst_paise: 0,
          total_paise: 1_490_535,
          currency: 'INR',
          trial_months_bump: 2,
          renewal_months: 3,
        },
      },
    ];

    const extensionBase = trialExtendExtensionBasePaise(plans, 'IN');
    expect(extensionBase).toBe(630_000);
    expect(trialExtendAddonBasePaise(1_029_900, extensionBase)).toBe(399_900);
    expect(trialExtendAddonBasePaise(630_000, extensionBase)).toBeNull();
  });
});
