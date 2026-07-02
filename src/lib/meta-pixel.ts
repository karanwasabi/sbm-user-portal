const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function canTrackMeta(): boolean {
  return Boolean(META_PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function');
}

export function metaPageView(): void {
  if (!canTrackMeta()) return;
  window.fbq?.('track', 'PageView');
}

export function trackMetaLead(): void {
  if (!canTrackMeta()) return;
  window.fbq?.('track', 'Lead');
}

export function trackMetaBeginCheckout(params?: { valuePaise?: number }): void {
  if (!canTrackMeta()) return;
  const payload =
    params?.valuePaise == null
      ? { currency: 'INR' }
      : {
          currency: 'INR',
          value: Math.round(params.valuePaise) / 100,
        };
  window.fbq?.('track', 'InitiateCheckout', payload);
}

export function trackMetaPurchase(params: { eventID: string; valuePaise?: number }): void {
  if (!canTrackMeta()) return;
  const payload =
    params.valuePaise == null
      ? { currency: 'INR' }
      : {
          currency: 'INR',
          value: Math.round(params.valuePaise) / 100,
        };
  window.fbq?.('track', 'Purchase', payload, { eventID: params.eventID });
}
