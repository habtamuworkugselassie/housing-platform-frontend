/** Split the last word off a headline so it can carry the accent colour and underline. */
export function splitHeadline(text) {
  const s = String(text || '').trim()
  const i = s.lastIndexOf(' ')
  if (i < 0) return { lead: '', accent: s }
  return { lead: s.slice(0, i), accent: s.slice(i + 1) }
}
