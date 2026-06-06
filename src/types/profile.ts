export type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

export function getDisplayName(profile: Profile): string {
  if (profile.first_name) return profile.first_name;
  return profile.email;
}

export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
}
