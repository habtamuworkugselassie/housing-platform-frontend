/**
 * Whether the visitor has agreed to analytics, and the plumbing that enforces it.
 *
 * The point of this module is that it is the only thing standing between a visitor and
 * Google Analytics. `initAnalytics()` is no longer called at startup; it is called from
 * here, and only after someone has said yes. If that inversion is ever undone, the banner
 * becomes decoration and the site is back to loading analytics on arrival while showing a
 * dialog that implies otherwise — which is worse than having no banner at all.
 *
 * Deliberately free of Vue, so `main.js` can consult it before the app mounts and the
 * first page view of a returning, consenting visitor is not lost.
 */

/** Recorded choice, and when. The date is what evidences consent if anyone asks. */
export const CONSENT_STORAGE_KEY = 'cookieConsent'

export const CONSENT_GRANTED = 'granted'
export const CONSENT_DENIED = 'denied'

const listeners = new Set()

/**
 * The stored choice, or null when nobody has chosen yet.
 *
 * Null is the important case: it means the banner must be shown and analytics must stay
 * off. Anything unreadable — private mode, blocked storage, a value from an older format
 * — is treated as null rather than guessed at, because guessing means assuming consent.
 */
export function readConsent() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const choice = JSON.parse(raw)?.choice
    return choice === CONSENT_GRANTED || choice === CONSENT_DENIED ? choice : null
  } catch {
    return null
  }
}

export function hasChosen() {
  return readConsent() !== null
}

export function analyticsAllowed() {
  return readConsent() === CONSENT_GRANTED
}

/** Records a choice and tells everyone who is listening. */
export function setConsent(choice) {
  if (choice !== CONSENT_GRANTED && choice !== CONSENT_DENIED) return
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ choice, at: new Date().toISOString() })
    )
  } catch {
    // Storage can be unavailable or full. The choice still applies to this page — the
    // listeners below run either way — it just will not be remembered next visit, which
    // means the banner asks again. Asking twice is the safe failure.
  }
  if (choice === CONSENT_DENIED) clearAnalyticsCookies()
  for (const listener of listeners) listener(choice)
}

/** Subscribe to changes. Returns an unsubscribe function. */
export function onConsentChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Expires the cookies Google Analytics has already set.
 *
 * Someone withdrawing consent expects the cookies to go, not merely to stop being added
 * to. gtag writes `_ga` and `_ga_<property>` on the registrable domain, so each name is
 * expired against every domain scope it could have been written on — a cookie deleted on
 * the wrong scope silently survives.
 */
export function clearAnalyticsCookies() {
  if (typeof document === 'undefined') return
  const names = document.cookie
    .split(';')
    .map((entry) => entry.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga') || name === '_gid')

  const host = window.location.hostname
  const labels = host.split('.')
  const scopes = new Set([undefined, host, `.${host}`])
  for (let i = 1; i < labels.length - 1; i += 1) {
    scopes.add(`.${labels.slice(i).join('.')}`)
  }

  for (const name of names) {
    for (const scope of scopes) {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
        (scope ? `; domain=${scope}` : '')
    }
  }
}
