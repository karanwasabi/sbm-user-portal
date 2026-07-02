import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import { apiFetch } from '@/utils/api';

type RazorpayReturnFields = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

async function readRazorpayReturnFields(request: NextRequest): Promise<RazorpayReturnFields | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const paymentId = String(form.get('razorpay_payment_id') ?? '').trim();
    const signature = String(form.get('razorpay_signature') ?? '').trim();
    if (!paymentId || !signature) return null;
    return {
      razorpay_payment_id: paymentId,
      razorpay_order_id: String(form.get('razorpay_order_id') ?? '').trim() || undefined,
      razorpay_subscription_id: String(form.get('razorpay_subscription_id') ?? '').trim() || undefined,
      razorpay_signature: signature,
    };
  }

  const body = (await request.json().catch(() => null)) as RazorpayReturnFields | null;
  if (!body?.razorpay_payment_id || !body.razorpay_signature) return null;
  return body;
}

function safeDestination(value: string | null): string {
  const destination = (value ?? PORTAL_HOME_PATH).trim();
  if (!destination.startsWith('/') || destination.startsWith('//')) {
    return PORTAL_HOME_PATH;
  }
  return destination;
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const sessionId = url.searchParams.get('session')?.trim() ?? '';
  const flow = url.searchParams.get('flow')?.trim() || 'enrollment';
  const destination = safeDestination(url.searchParams.get('destination'));

  const fields = await readRazorpayReturnFields(request);
  if (!fields) {
    const errorUrl = new URL('/payment/return', url.origin);
    errorUrl.searchParams.set('error', 'invalid');
    errorUrl.searchParams.set('destination', destination);
    return NextResponse.redirect(errorUrl, 303);
  }

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
    const errorUrl = new URL('/payment/return', url.origin);
    errorUrl.searchParams.set('error', 'invalid');
    errorUrl.searchParams.set('destination', destination);
    errorUrl.searchParams.set('flow', flow);
    return NextResponse.redirect(errorUrl, 303);
  }

  const successUrl = new URL('/payment/return', url.origin);
  successUrl.searchParams.set('destination', destination);
  successUrl.searchParams.set('flow', flow);
  if (sessionId) {
    successUrl.searchParams.set('session', sessionId);
  }
  return NextResponse.redirect(successUrl, 303);
}
