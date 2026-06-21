import { headers } from 'next/headers';
import { COUNTRY_DIAL_CODES } from '@/lib/country-dial-codes';

const COUNTRY_HEADERS = ['x-vercel-ip-country', 'cf-ipcountry', 'x-country-code'] as const;

/** Best-effort ISO country from the incoming request (Vercel, Cloudflare, etc.). */
export async function getRequestCountryIso(): Promise<string | undefined> {
  const headerStore = await headers();

  for (const name of COUNTRY_HEADERS) {
    const iso = headerStore.get(name)?.trim().toUpperCase();
    if (!iso || iso === 'XX') continue;
    if (COUNTRY_DIAL_CODES[iso]) return iso;
  }

  return undefined;
}
