// SYNC: keep API identical with sbm-forms/src/lib/meta-pixel.ts

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function canTrackMeta(): boolean {
  return Boolean(META_PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function');
}

function runWhenMetaReady(action: () => void, attemptsLeft = 20): void {
  if (canTrackMeta()) {
    action();
    return;
  }
  if (!META_PIXEL_ID || typeof window === 'undefined' || attemptsLeft <= 0) {
    return;
  }
  window.setTimeout(() => runWhenMetaReady(action, attemptsLeft - 1), 100);
}

/** Ensure Meta dedup keys align with server CAPI (`purchase:{sessionId}`). */
export function normalizeMetaPurchaseEventID(eventID: string): string {
  const trimmed = eventID.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith('purchase:') ? trimmed : `purchase:${trimmed}`;
}

export function metaPageView(): void {
  runWhenMetaReady(() => {
    window.fbq?.('track', 'PageView');
  });
}

export function trackMetaLead(params?: { eventID?: string }): void {
  const options = params?.eventID?.trim() ? { eventID: params.eventID.trim() } : undefined;
  runWhenMetaReady(() => {
    window.fbq?.('track', 'Lead', {}, options);
  });
}

export function trackMetaBeginCheckout(params?: { valuePaise?: number }): void {
  const payload =
    params?.valuePaise == null
      ? { currency: 'INR' }
      : {
          currency: 'INR',
          value: Math.round(params.valuePaise) / 100,
        };
  runWhenMetaReady(() => {
    window.fbq?.('track', 'InitiateCheckout', payload);
  });
}

export function trackMetaPurchase(params: {
  eventID: string;
  valuePaise?: number;
  trialProduct?: string;
  cohortName?: string;
}): void {
  const eventID = normalizeMetaPurchaseEventID(params.eventID);
  const payload: Record<string, unknown> =
    params.valuePaise == null
      ? { currency: 'INR' }
      : {
          currency: 'INR',
          value: Math.round(params.valuePaise) / 100,
        };

  if (params.trialProduct) {
    payload.content_category = 'take-control';
    payload.content_name = params.trialProduct;
    payload.trial_product = params.trialProduct;
  }
  if (params.cohortName) {
    payload.content_ids = [params.cohortName];
  }

  runWhenMetaReady(() => {
    window.fbq?.('track', 'Purchase', payload, { eventID });
  });
}

export function trackMetaCompleteRegistration(params: { eventID: string }): void {
  const eventID = params.eventID.trim();
  if (!eventID) return;
  runWhenMetaReady(() => {
    window.fbq?.('track', 'CompleteRegistration', { currency: 'INR' }, { eventID });
  });
}

export function trackMetaCustom(eventName: string, params?: Record<string, unknown>): void {
  runWhenMetaReady(() => {
    window.fbq?.('trackCustom', eventName, params);
  });
}
