import { PAYMENT_HANDOFF_LOGIN_INLINE_SCRIPT } from '@/lib/payment-handoff-inline-script';
import Script from 'next/script';

export function PaymentHandoffRedirectScript() {
  return (
    <Script id="payment-handoff-redirect" strategy="beforeInteractive">
      {PAYMENT_HANDOFF_LOGIN_INLINE_SCRIPT}
    </Script>
  );
}
