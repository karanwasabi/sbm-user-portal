export type TrialProduct = 'trial_1m' | 'trial_3m';

export type TrialQuote = {
  product: TrialProduct;
  pricing_region: 'domestic' | 'international';
  base_paise: number;
  conversion_paise?: number;
  gst_paise: number;
  total_paise: number;
  currency: string;
  monthly_base_paise: number;
  monthly_gst_paise: number;
  monthly_total_paise: number;
};

export type TrialCheckoutPreview = {
  program_slug: string;
  program_name: string;
  cohort_id: string;
  cohort_name: string;
  starts_on: string;
  days_until_start: number;
  product: TrialProduct;
  domestic: TrialQuote;
  international: TrialQuote;
  razorpay_key_id?: string;
};

export type TrialCheckoutStartResponse = {
  checkout_session_id: string;
  razorpay_key_id?: string;
  razorpay_order_id?: string;
  amount_paise: number;
  currency: string;
  mock?: boolean;
  cohort_name: string;
  starts_on: string;
};

export type TrialPaymentStatus = {
  status: string;
  enrolled: boolean;
  cohort_name?: string;
  starts_on?: string;
  product?: string;
};

export type TrialStatus = {
  product: string;
  trial_months_paid: number;
  months_remaining: number;
  next_amount_paise?: number;
  access_until?: string;
  can_pay_next: boolean;
  next_installment?: number;
};

export type TrialCheckoutStartRequest = {
  product: TrialProduct;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  country_code: string;
  dpdp_consent: boolean;
};
