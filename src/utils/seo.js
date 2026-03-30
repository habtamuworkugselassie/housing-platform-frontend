import { mediaUrl } from '@/shared/api/client'

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const NOINDEX_ROBOTS = 'noindex, nofollow'

export function getPublicSiteUrl() {
  const v = import.meta.env.VITE_PUBLIC_SITE_URL
  if (typeof v === 'string' && v.trim()) {
    return v.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://ethiobuildconnect.et'
}

/** Canonical URL for a route (path only, no query string). */
export function canonicalUrlForRoute(to) {
  const base = getPublicSiteUrl()
  const path = to?.path || '/'
  return `${base}${path === '/' ? '' : path}`
}

/** Full page URL without query string, for the current window location. */
export function canonicalUrlForPath(pathname) {
  const base = getPublicSiteUrl()
  const path = pathname || '/'
  return `${base}${path === '/' ? '' : path}`
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

  const defaultOg = `${getPublicSiteUrl()}/ethio-build-connect-mark.png`
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
