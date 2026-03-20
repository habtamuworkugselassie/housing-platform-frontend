/**
 * Deduplicates network fetches for the same media URL so multiple <img>/<video> nodes
 * (same page, different sections) reuse one HTTP cache entry.
 *
 * Video URLs are not fetched here — a full GET would duplicate the heavy work of <video>
 * (range requests are handled by the browser + Range-capable backend cache).
 */
import { mediaUrl } from '@/shared/api/client'

const settled = new Map<string, Promise<void>>()

/** Matches common video paths; skip programmatic warm (see module doc). */
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|m4v|avi)(\?|$)/i

function warmResolved(full: string): Promise<void> {
  if (!full) return Promise.resolve()
  const existing = settled.get(full)
  if (existing) return existing
  const p = doWarm(full)
  settled.set(full, p)
  return p
}

async function doWarm(full: string): Promise<void> {
  if (VIDEO_EXT.test(full)) {
    return
  }
  try {
    await fetch(full, { mode: 'cors', credentials: 'omit', cache: 'default' })
  } catch {
    // Allow native elements to retry independently
  }
}

/**
 * Warm HTTP cache for a single path (relative or absolute). Same resolved URL returns the same
 * promise — only one in-flight network request per URL.
 */
export function warmMediaCache(path: string | null | undefined): Promise<void> {
  return warmResolved(mediaUrl(path))
}

export function warmMediaCacheBatch(paths: readonly (string | null | undefined)[]): void {
  const seen = new Set<string>()
  for (const p of paths) {
    const full = mediaUrl(p)
    if (!full || seen.has(full)) continue
    seen.add(full)
    void warmResolved(full)
  }
}
