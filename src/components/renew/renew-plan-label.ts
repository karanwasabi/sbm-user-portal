export function renewPlanLabel(planKey: string): string {
  switch (planKey) {
    case 'trial_1m':
      return '1 month trial';
    case 'trial_3m':
      return '3 months program';
    case 'renewal_1m':
      return '1 month membership';
    case 'renewal_3m':
      return '3 months membership';
    case 'renewal_6m':
      return '6 months membership';
    case 'renewal_12m':
      return '12 months membership';
    case 'trial_extend_2m':
      return '2 month extension';
    case 'trial_extend_2m_1m':
      return '2 month extension + 1 month membership';
    case 'trial_extend_2m_3m':
      return '2 month extension + 3 months membership';
    case 'trial_extend_2m_6m':
      return '2 month extension + 6 months membership';
    case 'trial_extend_2m_12m':
      return '2 month extension + 12 months membership';
    default:
      return planKey.replaceAll('_', ' ');
  }
}

/** Splits bundled trial_extend titles so the membership addon can be styled separately. */
export function splitRenewPlanLabel(planKey: string): { base: string; addon?: string } {
  const label = renewPlanLabel(planKey);
  const addonSep = ' + ';
  const sepIndex = label.indexOf(addonSep);
  if (sepIndex === -1) {
    return { base: label };
  }
  return {
    base: label.slice(0, sepIndex),
    addon: label.slice(sepIndex + 1),
  };
}
