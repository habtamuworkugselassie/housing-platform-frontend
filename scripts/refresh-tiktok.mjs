/**
 * Refresh the list of TikTok posts shown on the home page.
 *
 * Usage: npm run tiktok:refresh — then review the diff and commit it.
 *
 * The ids are read off TikTok's own creator embed page, the same document the profile embed
 * renders from, so there is no API key, nothing to sign in to and no scraping of the app.
 * It rewrites only the id array and the date beside it; if anything looks wrong it writes
 * nothing, because a half-updated list is worse than a stale one.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const MODULE_PATH = resolve(here, '../src/features/exhibition/tiktokVideos.js')
const HANDLE = 'ethiobuildconnect'
const SOURCE = `https://www.tiktok.com/embed/@${HANDLE}`

const res = await fetch(SOURCE, {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ethiobuildconnect-site-refresh)' }
})
if (!res.ok) {
  console.error(`TikTok returned HTTP ${res.status} for ${SOURCE}. Nothing written.`)
  process.exit(1)
}

const html = await res.text()
// Ids are 19 digits today; the range is wide enough to survive TikTok growing one.
const ids = [...new Set(html.match(/"id":"(\d{17,21})"/g)?.map((m) => m.slice(6, -1)) ?? [])]
  .sort((a, b) => (a.length === b.length ? b.localeCompare(a) : b.length - a.length))

if (ids.length < 3) {
  console.error(`Only found ${ids.length} video ids — TikTok probably changed the page. Nothing written.`)
  process.exit(1)
}

const source = readFileSync(MODULE_PATH, 'utf8')
const today = new Date().toISOString().slice(0, 10)
const list = ids.map((id) => `  '${id}'`).join(',\n')
const updated = source
  .replace(/\/\*\* Last refreshed: [^*]*\*\//, `/** Last refreshed: ${today}. */`)
  .replace(/export const TIKTOK_VIDEO_IDS = \[[^\]]*\]/, `export const TIKTOK_VIDEO_IDS = [\n${list}\n]`)

if (updated === source) {
  console.log(`Already up to date — ${ids.length} posts.`)
} else {
  writeFileSync(MODULE_PATH, updated)
  console.log(`Wrote ${ids.length} post ids, newest ${ids[0]}. Review the diff and commit it.`)
}
