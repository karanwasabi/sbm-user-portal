export type RenewCategory =
  | 'new_user'
  | 'new_lead_no_sub'
  | 'returnee_no_sub'
  | 'old_student_active_renew'
  | 'trial_extend'
  | 'newbie_auto_renew'
  | 'newbie_manual_renew'
  | 'member_auto_renew'
  | 'member_manual_renew';

export type RenewCheckEmailResponse = {
  category: RenewCategory;
  can_pay: boolean;
  first_name?: string;
  last_name?: string;
  country_iso?: string;
  whatsapp?: string;
  access_until?: string;
  next_renewal_at?: string;
  cohort_starts_on?: string;
  subscription_end_label?: string;
};

export type RenewQuote = {
  plan_key: string;
  pricing_region: 'domestic' | 'international';
  base_paise: number;
  conversion_paise?: number;
  discount_paise?: number;
  gst_paise: number;
  total_paise: number;
  currency: string;
  discount_label?: string;
  months?: number;
  trial_months_bump?: number;
  renewal_months?: number;
};

export type RenewPlanPreview = {
  plan_key: string;
  discount_label?: string;
  domestic: RenewQuote;
  international: RenewQuote;
};

export type RenewEnrollableCohort = {
  starts_on: string;
  name: string;
};

export type RenewCheckoutPreview = {
  category: RenewCategory;
  program_name: string;
  cohort_name: string;
  starts_on: string;
  /** True when this person is joining an open cohort and can pick among `cohorts`. */
  cohort_choice?: boolean;
  cohorts?: RenewEnrollableCohort[];
  /** Existing-member renew: access still open → that date; else today. */
  renew_from?: string;
  plans?: RenewPlanPreview[];
  trial_products?: string[];
  razorpay_key_id?: string;
};

export type RenewCheckoutStartRequest = {
  category: RenewCategory;
  plan_key: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  dpdp_consent: boolean;
  /** YYYY-MM-DD when joining an open cohort. */
  starts?: string;
  star_redemption_id?: string;
  promo_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
};

export type RenewCheckoutStartResponse = {
  checkout_session_id: string;
  razorpay_key_id?: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  amount_paise: number;
  currency: string;
  pricing_region: string;
  mock?: boolean;
  cohort_name: string;
  starts_on: string;
  category: RenewCategory;
  plan_key: string;
};

export type RenewPaymentStatus = {
  status: string;
  fulfilled: boolean;
  user_id?: string;
  cohort_name?: string;
  starts_on?: string;
  category?: string;
  plan_key?: string;
  access_until?: string;
};

export type RenewStarsBalance = {
  enabled: boolean;
  available_stars: number;
  earned_stars: number;
  rate_paise_per_star: number;
  category?: RenewCategory;
  can_pay: boolean;
  next_charge_total_paise?: number;
  next_renewal_at?: string;
  /** A captured renewal charge in the last 20 days can be refunded now. */
  immediate_cashback?: boolean;
  pending_cashback?: {
    redemption_id: string;
    stars_applied: number;
    discount_paise: number;
    status: string;
  };
  open_reservation?: {
    redemption_id: string;
    stars_applied: number;
    discount_paise: number;
    expires_at?: string;
  };
};

export type RenewStarsGrantResponse = {
  grant_token: string;
  expires_at: string;
};

export type RenewStarsApplyResponse = {
  redemption_id: string;
  path: string;
  status: string;
  stars_requested: number;
  stars_applied: number;
  discount_paise: number;
  clamped: boolean;
  base_paise?: number;
  gst_paise?: number;
  total_paise?: number;
};
