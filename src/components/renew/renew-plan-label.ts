export function renewPlanLabel(planKey: string): string {
  switch (planKey) {
    case 'trial_1m':
      return '1 month trial';
    case 'trial_3m':
      return '3 months program';
    case 'renewal_1m':
      return '1 month';
    case 'renewal_3m':
      return '3 months';
    case 'renewal_6m':
      return '6 months';
    case 'renewal_12m':
      return '12 months';
    case 'trial_extend_2m':
      return 'Extend trial by 2 months';
    case 'trial_extend_2m_1m':
      return '2 month trial + 1 month';
    case 'trial_extend_2m_3m':
      return '2 month trial + 3 months';
    case 'trial_extend_2m_6m':
      return '2 month trial + 6 months';
    case 'trial_extend_2m_12m':
      return '2 month trial + 12 months';
    default:
      return planKey.replaceAll('_', ' ');
  }
}
