export const SUBDIVISION_LABEL_BY_COUNTRY: Record<string, string> = {
  US: 'State',
  IN: 'State',
  AU: 'State / Territory',
  BR: 'State',
  MX: 'State',
  MY: 'State',
  NG: 'State',
  DE: 'State',
  AT: 'State',
  CH: 'Canton',
  CA: 'Province / Territory',
  PK: 'Province',
  CN: 'Province',
  JP: 'Prefecture',
  IT: 'Region',
  ES: 'Autonomous community',
  FR: 'Region',
  PH: 'Province',
  ID: 'Province',
  TH: 'Province',
  AE: 'Emirate',
  ZA: 'Province',
};

export function subdivisionLabelForCountry(countryCode: string): string {
  return SUBDIVISION_LABEL_BY_COUNTRY[countryCode] ?? 'Region';
}
