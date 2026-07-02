import { PAYMENT_HANDOFF_LOGIN_INLINE_SCRIPT } from '@/lib/payment-handoff-inline-script';

export function PaymentHandoffRedirectScript() {
  return <script dangerouslySetInnerHTML={{ __html: PAYMENT_HANDOFF_LOGIN_INLINE_SCRIPT }} />;
}
