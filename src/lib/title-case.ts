/**
 * Title-case each word as the user types. Preserves spaces, hyphens, and apostrophes
 * (e.g. "mary-jane o'brien" → "Mary-Jane O'Brien").
 */
export function toTitleCase(value: string): string {
  let result = '';
  let capitalizeNext = true;

  for (const char of value) {
    if (/[\s\-']/.test(char)) {
      result += char;
      capitalizeNext = true;
    } else if (/[a-zA-Z\u00C0-\u024F]/.test(char)) {
      result += capitalizeNext ? char.toUpperCase() : char.toLowerCase();
      capitalizeNext = false;
    } else {
      result += char;
      capitalizeNext = false;
    }
  }

  return result;
}
