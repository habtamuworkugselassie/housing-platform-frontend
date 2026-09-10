/**
 * Structured facts about the expo, for schema.org markup.
 *
 * These must stay in step with the display string the hero renders
 * (`exhibition.hero.dateVenue` in the locale files, currently
 * "16–18 November 2026 — Addis Convention Center — Addis Ababa, Ethiopia").
 * Search engines penalise event markup that disagrees with the visible page, so if
 * the dates or venue move, change both.
 *
 * Times are +03:00 (Africa/Addis_Ababa, no DST). The dates carry no clock time on
 * the page, so the day boundaries are used rather than invented opening hours.
 */
export const EXPO_EVENT = {
  name: 'Ethio Build Connect Expo',
  startDate: '2026-11-16T00:00:00+03:00',
  endDate: '2026-11-18T23:59:59+03:00',
  venueName: 'Addis Convention Center',
  addressLocality: 'Addis Ababa',
  addressCountry: 'ET'
}
