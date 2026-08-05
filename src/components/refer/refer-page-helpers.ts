export const REFER_PAGE_TITLE = 'Refer a friend to Take Control';
export const REFER_PAGE_SUBTITLE =
  'Share Take Control with someone who could benefit. We’ll reach out and help them get started.';

export const REFER_REFERRER_SECTION = 'Your details';
export const REFER_REFERRED_SECTION = 'Your friend’s details';

export const REFER_CONSENT_LABEL =
  'I confirm my friend is okay with Slow Burn Method contacting them about Take Control.';

export const REFER_BLOCKED_DEFAULT =
  'Good news — they’re already in our system with Take Control membership. They don’t need a referral to join.';

export function referSuccessMessage(referredFirstName: string, referredLastName: string): string {
  const name = [referredFirstName.trim(), referredLastName.trim()].filter(Boolean).join(' ');
  if (name) {
    return `Thanks for referring ${name}! We’ve added them to our list and will reach out soon.`;
  }
  return 'Thanks for your referral! We’ve added them to our list and will reach out soon.';
}

export function isValidReferEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
