export function buildLoginUrl(email?: string): string {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return '/login';
  return `/login?email=${encodeURIComponent(trimmed)}`;
}

export function normalizeLoginEmailParam(email?: string): string {
  return email?.trim().toLowerCase() ?? '';
}
