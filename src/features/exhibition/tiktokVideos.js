/**
 * The TikTok posts shown on the home page.
 *
 * Why ids and not the profile: TikTok has two embeds. The creator embed takes the handle and
 * follows the account on its own, but it only renders tiles — clicking one leaves the site for
 * tiktok.com. The video embed takes an id and plays in place, which is the point of putting
 * videos on the page at all. So the ids are listed, and the tradeoff is that a new post shows
 * up here only once this list is updated.
 *
 * To refresh: `npm run tiktok:refresh`, then commit the change. The script reads the ids off
 * TikTok's own creator embed page, so it needs no key and nothing to log into.
 *
 * Ids are time-ordered by TikTok, so the newest post is simply the largest number — which is
 * what `latestVideoIds()` relies on rather than the order they happen to be written in.
 */
export const TIKTOK_HANDLE = 'ethiobuildconnect'
export const TIKTOK_PROFILE_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`

/** Last refreshed: 2026-09-11. */
export const TIKTOK_VIDEO_IDS = [
  '7639787363325021461',
  '7638666980664397076',
  '7637572875070819604',
  '7636827555093286165',
  '7633134246273551636',
  '7632351231817583893',
  '7631623562654666005',
  '7624511424132252673'
]

/** The player for one post. Nothing else on the page may reach tiktok.com. */
export function embedUrl(id) {
  return `https://www.tiktok.com/embed/v2/${id}`
}

/** Newest first, however the list above happens to be ordered. */
export function latestVideoIds(count) {
  return [...TIKTOK_VIDEO_IDS].sort((a, b) => (a.length === b.length ? b.localeCompare(a) : b.length - a.length)).slice(0, count)
}
