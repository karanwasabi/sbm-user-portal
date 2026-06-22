export const SUPPORT_EMAIL = 'support@slowburnmethod.in';

const DEFAULT_SUBJECT = 'Support Request';

type SupportMailtoOptions = {
  memberName?: string | null;
  memberEmail?: string | null;
};

export function buildSupportMailtoHref({ memberName, memberEmail }: SupportMailtoOptions = {}): string {
  const trimmedName = memberName?.trim();
  const subject = trimmedName ? `Support Request [${trimmedName}]` : DEFAULT_SUBJECT;

  const params = new URLSearchParams();
  params.set('subject', subject);

  const trimmedEmail = memberEmail?.trim();
  if (trimmedEmail) {
    params.set('body', `Registered Email: ${trimmedEmail}\n\nDescribe your issue:\n`);
  }

  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}
