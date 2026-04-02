export function normalizeCategoryName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeCategoryKey(value: unknown): string {
  return normalizeCategoryName(value).toLowerCase();
}