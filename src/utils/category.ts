export function normalizeCategoryName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeCategoryKey(value: unknown): string {
  return normalizeCategoryName(value).toLowerCase();
}

type CategoryNameSource = { name: string };

export function resolveCategoryName(
  value: unknown,
  sources: CategoryNameSource[] = []
): string {
  const normalized = normalizeCategoryName(value);
  if (!normalized) return "";

  const normalizedKey = normalizeCategoryKey(normalized);
  const match = sources.find((source) => normalizeCategoryKey(source.name) === normalizedKey);
  return match ? normalizeCategoryName(match.name) : normalized;
}

export function canonicalizeCategoryNames(
  values: unknown[],
  sources: CategoryNameSource[] = []
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  values.forEach((value) => {
    const resolved = resolveCategoryName(value, sources);
    const key = normalizeCategoryKey(resolved);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(resolved);
  });

  return result;
}