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
  can_start_monthly_billing: boolean;
  can_restore_subscription: boolean;
  monthly_billing_start_at?: string | null;
  catch_up_charge_now?: boolean;
};

export type PaymentMethodUpdateResponse = {
  razorpay_key_id: string;
  subscription_id: string;
  customer_id?: string;
};

export type ContinueBillingResponse = {
  razorpay_key_id?: string;
  razorpay_subscription_id?: string;
  monthly_billing_start_at: string;
  catch_up_charge_now: boolean;
  mock?: boolean;
};
