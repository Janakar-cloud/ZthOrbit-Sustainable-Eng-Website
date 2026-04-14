const COPY_SUFFIX_RE = /\s*\(\d+\)\s*$/;

export function stripCopySuffix(value: string): string {
  return value.replace(COPY_SUFFIX_RE, "").trim();
}

export function isCopyVariantTitle(value: string): boolean {
  return COPY_SUFFIX_RE.test(value.trim());
}

export function normalizeMediaTitle(value: string): string {
  return stripCopySuffix(value)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function filterCanonicalMedia<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const title = item.title?.trim() ?? "";
    if (!title) return false;

    // Deduplicate by exact title (case-insensitive) only — do not reject (1)-suffixed titles
    const key = title.replace(/\s+/g, " ").toLowerCase();
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}