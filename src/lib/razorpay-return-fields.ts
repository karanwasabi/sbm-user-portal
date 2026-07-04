export type RazorpayReturnFields = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

export type RazorpayReturnParseFailure = {
  reason: 'empty_body' | 'missing_payment_fields' | 'body_read_failed' | 'invalid_json' | 'form_read_failed';
  contentType: string;
  bodyLength?: number;
};

export type RazorpayReturnParseResult =
  | { ok: true; fields: RazorpayReturnFields }
  | { ok: false; failure: RazorpayReturnParseFailure };

function optionalField(value: FormDataEntryValue | string | null | undefined): string | undefined {
  const trimmed = String(value ?? '').trim();
  return trimmed || undefined;
}

function fieldsFromParts(parts: {
  paymentId?: string;
  signature?: string;
  orderId?: string;
  subscriptionId?: string;
}): RazorpayReturnFields | null {
  const paymentId = parts.paymentId?.trim() ?? '';
  const signature = parts.signature?.trim() ?? '';
  if (!paymentId || !signature) {
    return null;
  }

  return {
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    razorpay_order_id: optionalField(parts.orderId),
    razorpay_subscription_id: optionalField(parts.subscriptionId),
  };
}

export function fieldsFromFormData(form: FormData): RazorpayReturnFields | null {
  return fieldsFromParts({
    paymentId: String(form.get('razorpay_payment_id') ?? ''),
    signature: String(form.get('razorpay_signature') ?? ''),
    orderId: String(form.get('razorpay_order_id') ?? ''),
    subscriptionId: String(form.get('razorpay_subscription_id') ?? ''),
  });
}

export function fieldsFromUrlEncodedBody(body: string): RazorpayReturnFields | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return null;
  }

  const params = new URLSearchParams(trimmed);
  return fieldsFromParts({
    paymentId: params.get('razorpay_payment_id') ?? undefined,
    signature: params.get('razorpay_signature') ?? undefined,
    orderId: params.get('razorpay_order_id') ?? undefined,
    subscriptionId: params.get('razorpay_subscription_id') ?? undefined,
  });
}

export function fieldsFromJsonBody(body: string): RazorpayReturnFields | null {
  const trimmed = body.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }

  const parsed = JSON.parse(trimmed) as Partial<RazorpayReturnFields>;
  return fieldsFromParts({
    paymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
    orderId: parsed.razorpay_order_id,
    subscriptionId: parsed.razorpay_subscription_id,
  });
}

/** Parse Razorpay callback POST bodies (form-urlencoded, missing Content-Type, JSON, multipart). */
export async function parseRazorpayReturnRequest(request: Request): Promise<RazorpayReturnParseResult> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    try {
      const fields = fieldsFromFormData(await request.formData());
      if (fields) {
        return { ok: true, fields };
      }
      return {
        ok: false,
        failure: { reason: 'missing_payment_fields', contentType },
      };
    } catch {
      return {
        ok: false,
        failure: { reason: 'form_read_failed', contentType },
      };
    }
  }

  let body = '';
  try {
    body = await request.text();
  } catch {
    return {
      ok: false,
      failure: { reason: 'body_read_failed', contentType },
    };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return {
      ok: false,
      failure: { reason: 'empty_body', contentType, bodyLength: 0 },
    };
  }

  const fromUrlEncoded = fieldsFromUrlEncodedBody(trimmed);
  if (fromUrlEncoded) {
    return { ok: true, fields: fromUrlEncoded };
  }

  try {
    const fromJson = fieldsFromJsonBody(trimmed);
    if (fromJson) {
      return { ok: true, fields: fromJson };
    }
  } catch {
    return {
      ok: false,
      failure: { reason: 'invalid_json', contentType, bodyLength: trimmed.length },
    };
  }

  return {
    ok: false,
    failure: { reason: 'missing_payment_fields', contentType, bodyLength: trimmed.length },
  };
}
