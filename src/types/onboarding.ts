export type CompleteOnboardingState = {
  error: string | null;
  success: boolean;
};

/** Shared with register flow when DPDP consent is pending after email verification. */
export const PENDING_DPDP_COOKIE = 'sbm_pending_dpdp';
