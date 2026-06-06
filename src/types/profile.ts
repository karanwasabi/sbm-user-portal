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

export function getFullName(profile: Profile): string {
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return profile.email;
}

export function getInitials(profile: Profile): string {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }
  if (profile.first_name) return profile.first_name.slice(0, 2).toUpperCase();
  return profile.email.slice(0, 2).toUpperCase();
}

export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
}
