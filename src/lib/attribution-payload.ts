import { readMetaCookies } from '@/lib/meta-cookies';
import { readUtmAttributionFromCookie, type UtmAttribution } from '@/lib/utm-attribution';

export type AttributionPayload = UtmAttribution & {
  fbp?: string;
  fbc?: string;
};

/** UTM first-touch plus Meta browser cookies for API attribution payloads. */
export function readAttributionPayloadForApi(): AttributionPayload | null {
  const utm = readUtmAttributionFromCookie();
  const meta = readMetaCookies();
  const merged: AttributionPayload = {
    ...(utm ?? {}),
    ...meta,
  };
  const hasData = Object.values(merged).some((value) => Boolean(value?.trim()));
  return hasData ? merged : null;
}
