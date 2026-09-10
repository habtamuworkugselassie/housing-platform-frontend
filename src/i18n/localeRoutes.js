/**
 * Where a language lives in the URL.
 *
 * Amharic used to be a setting in `localStorage`, which meant English and Amharic shared
 * one URL. Search engines index URLs, so only one of the two could ever be indexed, and
 * `hreflang` could not be declared at all — there was no second address to point it at.
 * Amharic now has its own path prefix and is indexed in its own right.
 *
 * English stays unprefixed. It is the default, it is what every existing inbound link and
 * every indexed URL already points at, and moving it to `/en` would redirect the whole
 * site for no gain.
 *
 * Oromo and Arabic are deliberately absent. `src/i18n/index.js` serves them the English
 * catalogue until real translations exist, so giving them URLs would publish English
 * pages claiming to be Oromo and Arabic — three addresses for one page, and an hreflang
 * set that lies. They stay a display preference until someone translates them.
 */

/** Locales with their own URL prefix. Add one only once its catalogue is real. */
export const URL_LOCALES = ['am']

/** The language served by an unprefixed path. */
export const DEFAULT_URL_LOCALE = 'en'

/** Every language a URL can name, default first. */
export const INDEXABLE_LOCALES = [DEFAULT_URL_LOCALE, ...URL_LOCALES]

export function isUrlLocale(locale) {
  return URL_LOCALES.includes(locale)
}

/** `/am` for a prefixed locale, empty for the default. */
export function localePrefix(locale) {
  return isUrlLocale(locale) ? `/${locale}` : ''
}

/** The language a path is written in. */
export function localeFromPath(pathname) {
  const path = pathname || '/'
  for (const locale of URL_LOCALES) {
    if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return locale
  }
  return DEFAULT_URL_LOCALE
}

/** The path with any locale prefix removed, always beginning with a slash. */
export function stripLocale(pathname) {
  const path = pathname || '/'
  for (const locale of URL_LOCALES) {
    if (path === `/${locale}`) return '/'
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1)
  }
  return path
}

/**
 * The same page addressed in another language.
 *
 * `/real-estate` in Amharic is `/am/real-estate`; `/am` in English is `/`. Used by the
 * language switcher, which navigates rather than toggling a setting, and by the hreflang
 * tags, which need every alternate's address.
 */
export function pathForLocale(pathname, locale) {
  const base = stripLocale(pathname)
  const prefix = localePrefix(locale)
  if (!prefix) return base
  return base === '/' ? prefix : `${prefix}${base}`
}
