export type BillingScheduleItem = {
  date: string;
  amount_paise: number;
  status: 'paid' | 'upcoming' | 'failed';
  kind: 'upfront' | 'monthly';
};

export type Subscription = {
  program_name: string;
  enrollment_status: string;
  phase?: 'initial' | 'monthly' | null;
  subscription_status: string;
  plan_label: string;
  monthly_base_paise: number;
  monthly_gst_paise: number;
  monthly_total_paise: number;
  currency: string;
  recurring_start_at?: string | null;
  next_renewal_at?: string | null;
  access_until?: string | null;
  cancel_at_period_end: boolean;
  payment_method_summary?: string;
  billing_schedule: BillingScheduleItem[];
  can_cancel: boolean;
  can_update_payment: boolean;
};

export type PaymentMethodUpdateResponse = {
  razorpay_key_id: string;
  subscription_id: string;
  customer_id?: string;
};
