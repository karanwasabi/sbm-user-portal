export const PAYMENT_COMPLETE_QUERY_PARAM = 'payment_complete';

export function dashboardUrlForCompletedPayment(): string {
  return `/?${PAYMENT_COMPLETE_QUERY_PARAM}=1`;
}
