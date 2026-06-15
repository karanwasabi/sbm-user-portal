import {
  COUNTRY_DIAL_CODES,
  getCountryDialCode,
  normalizeDialCode,
  resolveIsoForDialCode,
} from '@/lib/country-dial-codes';

export type ParsedPhone = {
  dialCode: string;
  dialIso: string;
  nationalNumber: string;
};

const DIAL_CODES_BY_LENGTH = Object.values(COUNTRY_DIAL_CODES)
  .filter((dial, index, all) => all.indexOf(dial) === index)
  .sort((a, b) => b.length - a.length);

export function parseWhatsapp(value: string, preferredIso?: string): ParsedPhone {
  const trimmed = value.trim();
  if (!trimmed) {
    return { dialCode: '', dialIso: '', nationalNumber: '' };
  }

  const compact = trimmed.replace(/[\s().-]/g, '');
  const withPlus = compact.startsWith('+') ? compact : `+${compact.replace(/^\+/, '')}`;

  if (preferredIso) {
    const preferredDial = getCountryDialCode(preferredIso);
    if (preferredDial && withPlus.startsWith(preferredDial)) {
      return {
        dialCode: preferredDial,
        dialIso: preferredIso.toUpperCase(),
        nationalNumber: withPlus.slice(preferredDial.length).replace(/\D/g, ''),
      };
    }
  }

  for (const dial of DIAL_CODES_BY_LENGTH) {
    if (!withPlus.startsWith(dial)) continue;
    const national = withPlus.slice(dial.length).replace(/\D/g, '');
    return {
      dialCode: dial,
      dialIso: resolveIsoForDialCode(dial, preferredIso),
      nationalNumber: national,
    };
  }

  const digitsOnly = compact.replace(/\D/g, '');
  return { dialCode: '', dialIso: '', nationalNumber: digitsOnly };
}

export function combineWhatsapp(dialCode: string, nationalNumber: string): string {
  const dial = normalizeDialCode(dialCode);
  const national = nationalNumber.replace(/\D/g, '');
  if (!national) return '';
  if (!dial) return national;
  return `${dial}${national}`;
}

export function getDialCodeForCountry(isoCode: string): string {
  return getCountryDialCode(isoCode);
}
