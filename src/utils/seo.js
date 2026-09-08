import { mediaUrl } from '@/shared/api/client'

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const NOINDEX_ROBOTS = 'noindex, nofollow'

export function getPublicSiteUrl() {
  const v = import.meta.env.VITE_PUBLIC_SITE_URL
  if (typeof v === 'string' && v.trim()) {
    return v.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Drop a leading `www.`: this site declares the apex everywhere that matters
    // (robots.txt, sitemap.xml, og:url, index.html), and both hosts answer without a
    // redirect. Echoing back whichever host was requested made each one canonical to
    // itself, splitting every page into two competing URLs.
    return window.location.origin.replace('://www.', '://')
  }
  return 'https://ethiobuildconnect.et'
}

/**
 * Canonical URL for a route (path only, no query string).
 *
 * A route may name another path as its canonical owner via `meta.canonicalPath`. Some
 * routes render the same component with no route-dependent content at all — `/` and
 * `/exhibition` are the same expo page, `/real-estate` and `/marketplace/real-estate`
 * the same search page — and two URLs that each declared themselves canonical split
 * one page's ranking signals between them. Pointing the alias at the owner spends
 * every link on one URL instead.
 */
export function canonicalUrlForRoute(to) {
  return canonicalUrlForPath(to?.meta?.canonicalPath || to?.path)
}

/**
 * Full page URL without query string, for a path or the current window location.
 * The home page keeps its trailing slash so this agrees character-for-character with
 * sitemap.xml, robots.txt, the static og:url and the nginx Link header.
 */
export function canonicalUrlForPath(pathname) {
  const base = getPublicSiteUrl()
  const path = pathname || '/'
  return `${base}${path === '/' ? '/' : path}`
}

export function ensureMetaTag(name, attr = 'name') {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  return tag
}

export function ensureLinkTag(rel, href) {
  let link = document.head.querySelector(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
  return link
}

export function setRobotsMeta(content) {
  ensureMetaTag('robots').setAttribute('content', content)
}

export function applyIndexableRobots() {
  setRobotsMeta(INDEX_ROBOTS)
}

export function applyNoindexRobots() {
  setRobotsMeta(NOINDEX_ROBOTS)
}

/**
 * Updates title, description, Open Graph, Twitter, canonical, and og:url.
 * Does not change robots; the router sets index/noindex per route.
 */
export function applyPageSeo({ title, description, imageUrl, pagePath }) {
  const pageUrl = pagePath != null ? canonicalUrlForPath(pagePath) : canonicalUrlForPath(window.location.pathname)

  ensureLinkTag('canonical', pageUrl)
  ensureMetaTag('og:url', 'property').setAttribute('content', pageUrl)

  document.title = title
  ensureMetaTag('description').setAttribute('content', description)
  ensureMetaTag('og:title', 'property').setAttribute('content', title)
  ensureMetaTag('og:description', 'property').setAttribute('content', description)
  ensureMetaTag('twitter:title').setAttribute('content', title)
  ensureMetaTag('twitter:description').setAttribute('content', description)

  const defaultOg = `${getPublicSiteUrl()}/images/branding/ethio-build-connect-banner.png`
  const resolvedImage = imageUrl ? resolveAbsoluteMediaUrl(imageUrl) : defaultOg
  ensureMetaTag('og:image', 'property').setAttribute('content', resolvedImage || defaultOg)
  ensureMetaTag('twitter:image').setAttribute('content', resolvedImage || defaultOg)
  ensureMetaTag('twitter:card').setAttribute('content', 'summary_large_image')
}

export function resolveAbsoluteMediaUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return ''
  return mediaUrl(pathOrUrl)
}

export function truncateMetaDescription(text, max = 160) {
  if (!text) return ''
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

export function removeJsonLdById(id) {
  const el = document.getElementById(id)
  if (el?.parentNode) {
    el.parentNode.removeChild(el)
  }
}

export function setJsonLdById(id, jsonLdObject) {
  removeJsonLdById(id)
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(jsonLdObject)
  document.head.appendChild(script)
}

/** Shared id for the BreadcrumbList block, so detail views don't each invent one. */
export const BREADCRUMB_JSON_LD_ID = 'dynamic-breadcrumb-jsonld'

/**
 * Emits a BreadcrumbList for the current page.
 *
 * Entries are `{ name, path }`, ordered root-first, and the last one should be the
 * current page — Google expects the trail to end at the page it is describing.
 * `path` is site-relative and is normally omitted on that last entry, since a
 * crumb for the page you are already on needs no link.
 */
const EXPO_EVENT_JSON_LD_ID = 'expo-event-jsonld'

/**
 * ExhibitionEvent markup for the expo landing page.
 *
 * schema.org has a dedicated subtype for trade shows, which describes this more
 * precisely than a bare Event. Only what the page itself states is asserted: no
 * offers block, because the page invites visitors to register interest rather than
 * naming a ticket price, and claiming a price we do not publish would be wrong.
 *
 * Scoped to the expo route and torn down on leave, so no other URL claims to be
 * the event page.
 */
export function setExpoEventJsonLd(event, { description, image } = {}) {
  // The home page is the expo page: `/exhibition` renders the same component and
  // canonicalises to `/`, so the event's own URL has to name the canonical one. An
  // Event pointing at a URL Google has folded away describes a page it will not show.
  const url = canonicalUrlForPath('/')
  setJsonLdById(EXPO_EVENT_JSON_LD_ID, {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venueName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.addressLocality,
        addressCountry: event.addressCountry
      }
    },
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    organizer: {
      '@type': 'Organization',
      name: 'Ethio Build Connect',
      url: canonicalUrlForPath('/')
    },
    url
  })
}

export function removeExpoEventJsonLd() {
  removeJsonLdById(EXPO_EVENT_JSON_LD_ID)
}

export function setBreadcrumbJsonLd(trail) {
  const items = (trail || []).filter((c) => c && c.name)
  if (items.length < 2) {
    // A single crumb is not a trail; emitting one produces an invalid rich result.
    removeJsonLdById(BREADCRUMB_JSON_LD_ID)
    return
  }
  const base = getPublicSiteUrl()
  setJsonLdById(BREADCRUMB_JSON_LD_ID, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => {
      const entry = {
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name
      }
      if (crumb.path) {
        entry.item = `${base}${crumb.path === '/' ? '' : crumb.path}`
      }
      return entry
    })
  })
}

export function removeBreadcrumbJsonLd() {
  removeJsonLdById(BREADCRUMB_JSON_LD_ID)
}

/**
 * AggregateRating for an entity that has reviews, or undefined when it has none.
 *
 * Google drops the whole rich result if aggregateRating is present but empty or
 * zero-count, so the caller assigns this only when it comes back defined. Ratings
 * on this site are the 1-5 stars collected by ReviewSection.
 */
export function buildAggregateRating(averageRating, reviewCount) {
  const value = Number(averageRating)
  const count = Number(reviewCount)
  if (!Number.isFinite(value) || value <= 0) return undefined
  if (!Number.isFinite(count) || count < 1) return undefined
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(value.toFixed(1)),
    reviewCount: Math.trunc(count),
    bestRating: 5,
    worstRating: 1
  }
}
