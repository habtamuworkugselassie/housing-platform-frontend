/**
 * Dated greetings that appear and disappear on their own.
 *
 * The point is that nobody has to remember to take one down. Each entry names the days it
 * runs, inclusive, and the banner is simply absent outside them — no deploy on the day, no
 * admin toggle left switched on into October.
 *
 * Dates are evaluated in **Addis Ababa time, not the visitor's**. A greeting for the
 * Ethiopian New Year should end when the day ends in Ethiopia; keyed off the browser clock
 * it would linger for a day in the Americas and vanish early in Asia. Ethiopia keeps
 * UTC+03:00 year-round with no daylight saving, so the offset is a constant rather than
 * something needing a timezone database.
 *
 * Plain ESM with no imports, so it can be unit-checked and read at a glance.
 */

/** Ethiopia is UTC+3 all year. */
const ADDIS_UTC_OFFSET_MINUTES = 3 * 60

/**
 * Occasions, oldest first. `through` is inclusive — the banner is up until that day ends
 * in Addis Ababa.
 *
 * Ethiopian dates in Gregorian terms: Enkutatash is 1 Meskerem, which falls on 11
 * September in most years and 12 September in the year before a Gregorian leap year.
 * Meskel is 17 Meskerem, sixteen days later, with Demera — the bonfire — on its eve.
 * Both are therefore written out per year rather than computed: a calendar conversion
 * that is subtly wrong once every four years is worse than a list somebody checks.
 */
export const SEASONAL_GREETINGS = [
  {
    id: 'enkutatash-2019',
    from: '2026-09-11',
    through: '2026-09-12',
    symbol: 'adey',
    titleKey: 'seasonal.enkutatash.title',
    subtitleKey: 'seasonal.enkutatash.subtitle'
  },
  {
    // Demera is the eve, so the greeting covers both evenings.
    id: 'meskel-2026',
    from: '2026-09-26',
    through: '2026-09-27',
    symbol: 'demera',
    titleKey: 'seasonal.meskel.title',
    subtitleKey: 'seasonal.meskel.subtitle'
  }
]

/** Today's date in Addis Ababa, as `YYYY-MM-DD`. */
export function addisDate(now = new Date()) {
  const shifted = new Date(now.getTime() + ADDIS_UTC_OFFSET_MINUTES * 60 * 1000)
  return shifted.toISOString().slice(0, 10)
}

/** The greeting running today, or null on every other day of the year. */
export function activeGreeting(now = new Date()) {
  const today = addisDate(now)
  return SEASONAL_GREETINGS.find((g) => today >= g.from && today <= g.through) || null
}

/** Per-occasion, so dismissing one does not silence the next. */
export function dismissalKey(id) {
  return `seasonalGreetingDismissed:${id}`
}
