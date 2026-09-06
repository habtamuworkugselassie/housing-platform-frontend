/**
 * Google Analytics 4.
 *
 * The tag only loads when VITE_GA_MEASUREMENT_ID is set, so dev servers, preview
 * builds and anyone running the app locally stay out of the production property.
 * Every helper below is a no-op until then, which keeps call sites guard-free.
 *
 * GA4's automatic page_view only fires on the initial document load. This is a
 * client-routed SPA, so navigations are sent manually from the router instead
 * (send_page_view is disabled in the config call to avoid double-counting the
 * first one).
 */

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()

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
