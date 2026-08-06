import { formatMetaFbc, readMetaCookies } from '@/lib/meta-cookies';
import { readUtmAttributionFromCookie, type UtmAttribution } from '@/lib/utm-attribution';

export type AttributionPayload = UtmAttribution & {
  fbp?: string;
  fbc?: string;
};

/** UTM first-touch plus Meta browser cookies for API attribution payloads. */
export function readAttributionPayloadForApi(): AttributionPayload | null {
  const utm = readUtmAttributionFromCookie();
  const meta = readMetaCookies();
  const fbc =
    meta.fbc ??
    (utm?.fbclid
      ? formatMetaFbc(utm.fbclid, (utm.meta_click_time ?? Math.floor(Date.now() / 1000)) * 1000)
      : undefined);
  const merged: AttributionPayload = {
    ...(utm ?? {}),
    ...meta,
    ...(fbc ? { fbc } : {}),
  };
  const hasData = Boolean(utm) || Boolean(meta.fbp) || Boolean(meta.fbc) || Boolean(fbc) || Boolean(utm?.fbclid);
  return hasData ? merged : null;
}
