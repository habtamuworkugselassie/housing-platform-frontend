/**
 * Normalize display-setting flags from API (boolean, string, or missing).
 */
export function coerceDisplayBool(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true' || value === 1 || value === '1') return true
  if (value === false || value === 'false' || value === 0 || value === '0') return false
  return fallback
}
