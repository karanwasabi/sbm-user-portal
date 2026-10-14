export type PublicEventSlot = {
  id: string;
  label: string;
  starts_at: string;
};

export type PublicEvent = {
  slug: string;
  name: string;
  description?: string | null;
  slots: PublicEventSlot[];
};

export type EventCheckEmailResponse = {
  known: boolean;
  lifecycle_stage?: string;
  profile_locked: boolean;
  has_dpdp_consent: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country_code?: string;
};

export type EventSubmitRequest = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country_code?: string;
  slot_id: string;
  dpdp_consent: boolean;
  /** Honeypot — must stay empty for real users. */
  website?: string;
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

export type EventSubmitResponse = {
  ok: boolean;
  message: string;
  lead_id?: string;
  registration_id?: string;
  created_lead: boolean;
};
