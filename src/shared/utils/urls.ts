/** Ensure absolute http(s) URL for user-entered website or social links. */
export function normalizeExternalUrl(raw: string | null | undefined): string {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}
