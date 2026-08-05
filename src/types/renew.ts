export type RenewCategory =
  | 'new_user'
  | 'new_lead_no_sub'
  | 'returnee_no_sub'
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

export type RenewCheckoutPreview = {
  category: RenewCategory;
  program_name: string;
  cohort_name: string;
  starts_on: string;
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
  cohort_name?: string;
  starts_on?: string;
  category?: string;
  plan_key?: string;
  access_until?: string;
};
