export function formatUserFacingError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .split(/(?<=\.)\s+/)
    .map((part) => {
      const segment = part.trim();
      if (!segment) return segment;
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(' ');
}
