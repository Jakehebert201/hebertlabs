/**
 * Frontmatter dates arrive as either a Date (unquoted YAML) or a string
 * (quoted). Parsing the string by hand avoids the UTC-vs-local shift that
 * `new Date('2026-09-01')` introduces.
 */
export function toDate(value) {
  // YAML resolves an unquoted date to UTC midnight, which reads back as the
  // previous day west of Greenwich. Rebuild it as local midnight so both
  // branches below hand back the same calendar day the author typed.
  if (value instanceof Date) {
    return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  if (typeof value !== 'string') return null;

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toISO(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return undefined;

  // Read back the same local fields toDate() set. toISOString() would convert
  // to UTC first and land on the previous day anywhere east of Greenwich.
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
