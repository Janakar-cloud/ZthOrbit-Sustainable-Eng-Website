/**
 * Escape special regex characters in a string to prevent ReDoS attacks
 * when using user input in `new RegExp()`.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
