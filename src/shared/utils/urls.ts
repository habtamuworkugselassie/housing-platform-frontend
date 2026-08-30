/** Ensure absolute http(s) URL for user-entered website or social links. */
export function normalizeExternalUrl(raw: string | null | undefined): string {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

/**
 * Convert a YouTube or Facebook live/watch URL into an embeddable player URL.
 * Accepts the forms people actually paste (youtu.be/ID, watch?v=ID, /live/ID,
 * an existing /embed/ID, or a Facebook video/live page) and returns a URL
 * suitable for an <iframe src>. Anything already looking like an embed URL, or
 * an unrecognised host, is returned normalized as-is so a manually-pasted embed
 * link still works.
 */
export function toEmbedUrl(raw: string | null | undefined): string {
  const url = normalizeExternalUrl(raw)
  if (!url) return ''
  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/)|youtu\.be\/)([\w-]{6,})/i)
  if (yt && yt[1]) return `https://www.youtube.com/embed/${yt[1]}`
  if (/youtube\.com\/embed\//i.test(url)) return url
  // Facebook — the plugin player wraps the original page URL
  if (/facebook\.com|fb\.watch/i.test(url) && !/facebook\.com\/plugins\/video/i.test(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
  }
  return url
}
