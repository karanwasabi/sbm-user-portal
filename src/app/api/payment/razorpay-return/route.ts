import { NextRequest, NextResponse } from 'next/server';
import { parseRazorpayReturnRequest } from '@/lib/razorpay-return-fields';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import { apiFetch } from '@/utils/api';

function safeDestination(value: string | null): string {
  const destination = (value ?? PORTAL_HOME_PATH).trim();
  if (!destination.startsWith('/') || destination.startsWith('//')) {
    return PORTAL_HOME_PATH;
  }
  return destination;
}

function redirectToPaymentReturn(
  origin: string,
  options: {
    destination: string;
    flow: string;
    sessionId: string;
    confirmFailed?: boolean;
  }
): NextResponse {
  const url = new URL('/payment/return', origin);
  url.searchParams.set('destination', options.destination);
  url.searchParams.set('flow', options.flow);
  if (options.confirmFailed) {
    url.searchParams.set('error', 'confirm_failed');
  }
  if (options.sessionId) {
    url.searchParams.set('session', options.sessionId);
  }
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const sessionId = url.searchParams.get('session')?.trim() ?? '';
  const flow = url.searchParams.get('flow')?.trim() || 'enrollment';
  const destination = safeDestination(url.searchParams.get('destination'));

  const parsed = await parseRazorpayReturnRequest(request);
  if (!parsed.ok) {
    console.warn('[razorpay-return] could not parse callback body', {
      reason: parsed.failure.reason,
      contentType: parsed.failure.contentType,
      bodyLength: parsed.failure.bodyLength,
      sessionId: sessionId || undefined,
      flow,
    });
    return redirectToPaymentReturn(url.origin, {
      destination,
      flow,
      sessionId,
      confirmFailed: true,
    });
  }

  const fields = parsed.fields;
  const response = await apiFetch('/me/checkout/payment-return', {
    method: 'POST',
    body: JSON.stringify({
      checkout_session_id: sessionId || undefined,
      flow,
      razorpay_payment_id: fields.razorpay_payment_id,
      razorpay_order_id: fields.razorpay_order_id,
      razorpay_subscription_id: fields.razorpay_subscription_id,
      razorpay_signature: fields.razorpay_signature,
    }),
  });

  if (!response.ok) {
    console.warn('[razorpay-return] backend payment-return failed', {
      status: response.status,
      sessionId: sessionId || undefined,
      flow,
      hasOrderId: Boolean(fields.razorpay_order_id),
      hasSubscriptionId: Boolean(fields.razorpay_subscription_id),
    });
    return redirectToPaymentReturn(url.origin, {
      destination,
      flow,
      sessionId,
      confirmFailed: true,
    });
  }

  return redirectToPaymentReturn(url.origin, {
    destination,
    flow,
    sessionId,
  });
}
