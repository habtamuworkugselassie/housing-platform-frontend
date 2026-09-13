/**
 * Where a visitor came from, carried as far as the registration form.
 *
 * Google Analytics already answers this — but only for visitors who accepted cookies, and only
 * in aggregate. The registration form is the one moment a visitor deliberately hands us their
 * details, and a lead whose channel is unknown cannot be compared against the campaign that
 * produced it. So the campaign tags are read from the address bar, held for the tab, and posted
 * with the form the visitor chooses to submit. Nothing is sent unless they submit it.
 *
 * Last campaign wins, not first: someone who arrives from a search, leaves, and comes back
 * through an ad before registering was converted by the ad. That is also how GA4 attributes a
 * session, which matters because the whole point is being able to compare the two reports.
 *
 * Session storage, not local: attribution belongs to this visit. A campaign tag from a week ago
 * still sitting in storage would quietly credit the wrong channel for months.
 */

const STORAGE_KEY = 'housing.campaign'

const UTM_PARAMS = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent'
}

// The server clips these to the column width anyway; trimming here keeps an absurd URL from
// filling session storage and from travelling in every form post.
const MAX_TAG_LENGTH = 180
const MAX_URL_LENGTH = 500

function clip(value, maxLength) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed
}

/** Our own pages are not a referrer worth recording; only where the visit came *from* is. */
function externalReferrer(referrer) {
  const value = clip(referrer, MAX_URL_LENGTH)
  if (!value) return undefined
  try {
    if (new URL(value).origin === window.location.origin) return undefined
  } catch {
    return undefined
  }
  return value
}

function read() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Private browsing, blocked site data, or a value someone else wrote. Attribution is a
    // reporting nicety; losing it must never cost a registration.
    return null
  }
}

function write(value) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* see read() */
  }
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined))
}

/**
 * Records the campaign for this visit, if the current URL names one.
 *
 * Safe to call on every navigation: a page without campaign tags never clears what an earlier
 * one stored, so following an internal link does not erase the ad that brought the visitor in.
 */
export function captureCampaignAttribution(
  href = window.location.href,
  referrer = typeof document === 'undefined' ? '' : document.referrer
) {
  let url
  try {
    url = new URL(href)
  } catch {
    return getCampaignAttribution()
  }

  const tags = {}
  for (const [param, field] of Object.entries(UTM_PARAMS)) {
    const value = clip(url.searchParams.get(param), MAX_TAG_LENGTH)
    if (value) tags[field] = value
  }

  const stored = read()
  if (Object.keys(tags).length === 0) {
    if (stored) return stored
    // No campaign, and nothing recorded yet — so this is the visit's first page. The referrer
    // and the page they landed on are still worth keeping: they are what identifies traffic
    // from a directory listing or a press article, none of which will carry utm tags.
    const arrival = compact({
      referrer: externalReferrer(referrer),
      landingPath: clip(url.pathname, MAX_URL_LENGTH)
    })
    write(arrival)
    return arrival
  }

  const captured = compact({
    ...tags,
    referrer: externalReferrer(referrer),
    landingPath: clip(url.pathname, MAX_URL_LENGTH)
  })
  write(captured)
  return captured
}

/** The attribution to post with a form. An empty object when there is nothing to say. */
export function getCampaignAttribution() {
  return read() || {}
}
