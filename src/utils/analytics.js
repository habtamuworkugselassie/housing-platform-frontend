/**
 * Google Analytics 4.
 *
 * The tag is skipped entirely on the dev server, so local work never lands in the
 * production property; every helper below is then a no-op, which keeps call sites
 * guard-free.
 *
 * GA4's automatic page_view only fires on the initial document load. This is a
 * client-routed SPA, so navigations are sent manually from the router instead
 * (send_page_view is disabled in the config call to avoid double-counting the
 * first one).
 */

// The site's own GA4 property. Kept as the default rather than an env-only value so
// a deploy that sets no build variables still reports; VITE_GA_MEASUREMENT_ID
// overrides it (a staging property, say), and an empty override disables the tag.
const DEFAULT_MEASUREMENT_ID = 'G-0BDWXN060N'
const envId = import.meta.env.VITE_GA_MEASUREMENT_ID
const MEASUREMENT_ID = String(envId === undefined ? DEFAULT_MEASUREMENT_ID : envId).trim()

let initialized = false

function gtag() {
  // gtag.js reads arguments off the array verbatim, so this cannot be a
  // rest-parameter spread — it must push the live `arguments` object.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
}

/** True once the tag is configured; false when no measurement ID is set. */
export function analyticsEnabled() {
  return initialized
}

export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID || typeof window === 'undefined') return
  // `vite dev` only — a production build always reports.
  if (import.meta.env.DEV) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || gtag

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })

  initialized = true
}

/**
 * Sends a page_view for an SPA navigation. Pass the path only — query strings
 * on this site carry filter state and listing IDs, which would fragment the
 * report into thousands of near-duplicate rows.
 */
export function trackPageView(path, title) {
  if (!initialized) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: `${window.location.origin}${path}`
  })
}

export function trackEvent(name, params = {}) {
  if (!initialized) return
  window.gtag('event', name, params)
}

/**
 * The site's primary conversion: an expo interest registration. `interestType`
 * is the visitor/exhibitor/partner split so the three funnels stay separable,
 * and `source` distinguishes the landing-page form from the standalone page.
 */
export function trackInterestRegistration({ interestType, organizationType, source }) {
  trackEvent('register_interest', {
    interest_type: interestType || 'visitor',
    organization_type: organizationType || undefined,
    form_source: source || undefined
  })
}
