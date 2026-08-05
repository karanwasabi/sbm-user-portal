export type ReferCheckReferrerEmailResponse = {
  in_system: boolean;
  first_name: string;
  last_name: string;
};

export type ReferCheckReferredEmailResponse = {
  eligible: boolean;
  blocked: boolean;
  blocked_reason?: string;
  first_name?: string;
  last_name?: string;
};

export type ReferSubmitRequest = {
  referrer_email?: string;
  referrer_first_name: string;
  referrer_last_name: string;
  referred_email: string;
  referred_first_name: string;
  referred_last_name: string;
  referred_phone: string;
  referred_country_code: string;
  referrer_consent: boolean;
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

export type ReferSubmitResponse = {
  success: boolean;
  lead_id: string;
  referral_id: string;
};
