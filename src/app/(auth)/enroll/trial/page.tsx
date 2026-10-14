import { redirect } from 'next/navigation';

type EnrollTrialRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(searchParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null && item !== '') params.append(key, item);
      }
      continue;
    }
    if (value !== '') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Legacy /enroll/trial bookmarks and ads → /enroll/monthly, preserving query params. */
export default async function EnrollTrialRedirectPage({ searchParams }: EnrollTrialRedirectProps) {
  const resolved = await searchParams;
  redirect(`/enroll/monthly${buildQueryString(resolved)}`);
}
