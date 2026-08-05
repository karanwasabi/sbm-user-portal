// SYNC: keep API identical with sbm-forms/src/lib/meta-cookies.ts

export type MetaCookieAttribution = {
  fbp?: string;
  fbc?: string;
};

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

/** Read Meta browser cookies set by the pixel (_fbp, _fbc). */
export function readMetaCookies(): MetaCookieAttribution {
  const fbp = readCookieValue('_fbp')?.trim();
  const fbc = readCookieValue('_fbc')?.trim();
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}
