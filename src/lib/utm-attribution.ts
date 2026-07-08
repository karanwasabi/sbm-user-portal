export const UTM_ATTRIBUTION_COOKIE = 'sbm_utm_first_touch';
const UTM_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type UtmAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

function normalizeUtmValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseUtmCookie(value?: string): UtmAttribution | null {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as UtmAttribution;
    return {
      utm_source: normalizeUtmValue(parsed.utm_source ?? null),
      utm_medium: normalizeUtmValue(parsed.utm_medium ?? null),
      utm_campaign: normalizeUtmValue(parsed.utm_campaign ?? null),
      utm_content: normalizeUtmValue(parsed.utm_content ?? null),
    };
  } catch {
    return null;
  }
}

function hasAnyUtm(value: UtmAttribution | null): value is UtmAttribution {
  return Boolean(value && (value.utm_source || value.utm_medium || value.utm_campaign || value.utm_content));
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(encodedName)) continue;
    return decodeURIComponent(trimmed.slice(encodedName.length));
  }
  return null;
}

function writeUtmCookie(value: UtmAttribution): void {
  if (typeof document === 'undefined') return;
  const serialized = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${UTM_ATTRIBUTION_COOKIE}=${serialized}; Max-Age=${UTM_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

export function readUtmAttributionFromCookie(): UtmAttribution | null {
  return parseUtmCookie(readCookieValue(UTM_ATTRIBUTION_COOKIE) ?? undefined);
}

export function captureUtmAttributionFromLocation(): UtmAttribution | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const fromUrl: UtmAttribution = {
    utm_source: normalizeUtmValue(url.searchParams.get('utm_source')),
    utm_medium: normalizeUtmValue(url.searchParams.get('utm_medium')),
    utm_campaign: normalizeUtmValue(url.searchParams.get('utm_campaign')),
    utm_content: normalizeUtmValue(url.searchParams.get('utm_content')),
  };

  const existing = readUtmAttributionFromCookie();
  const merged: UtmAttribution = {
    utm_source: existing?.utm_source ?? fromUrl.utm_source,
    utm_medium: existing?.utm_medium ?? fromUrl.utm_medium,
    utm_campaign: existing?.utm_campaign ?? fromUrl.utm_campaign,
    utm_content: existing?.utm_content ?? fromUrl.utm_content,
  };

  if (!hasAnyUtm(merged)) {
    return null;
  }
  writeUtmCookie(merged);
  return merged;
}
