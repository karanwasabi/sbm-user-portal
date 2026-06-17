export type CheckoutQuote = {
  pricing_region: 'domestic' | 'international';
  billing_type: 'personal' | 'business';
  upfront_base_paise: number;
  discount_paise: number;
  gst_paise: number;
  total_paise: number;
  monthly_base_paise: number;
  monthly_gst_paise: number;
  monthly_total_paise: number;
  currency: string;
  promo_code?: string | null;
};

export type CheckoutPreview = {
  program_slug: string;
  program_name: string;
  cohort_id: string;
  cohort_name: string;
  starts_on: string;
  days_until_start: number;
  domestic: CheckoutQuote;
  international: CheckoutQuote;
  razorpay_key_id?: string;
};

export type CheckoutQuoteRequest = {
  program_slug?: string;
  pricing_region: 'domestic' | 'international';
  billing_type: 'personal' | 'business';
  gstin?: string;
  legal_name?: string;
  billing_state?: string;
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  promo_code?: string;
};

export type CheckoutStartResponse = {
  checkout_session_id: string;
  enrollment_id: string;
  razorpay_key_id?: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  amount_paise: number;
  currency: string;
  mock?: boolean;
  cohort_name: string;
  starts_on: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  amount_paise: number;
  gst_paise: number;
  currency: string;
  status: string;
  issued_at: string;
  billing_snapshot: Record<string, unknown>;
};
