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

/**
 * The expo's ExhibitionEvent JSON-LD, as a plain object.
 *
 * Pure and DOM-free on purpose: the browser injects this at runtime via
 * setExpoEventJsonLd, and the prerender step serialises the very same object into the
 * static HTML so a crawler reads the event without executing any JavaScript. Building
 * it in one place keeps those two copies from drifting apart.
 *
 * schema.org has a dedicated subtype for trade shows, which describes this more
 * precisely than a bare Event. Only what the page itself states is asserted: no offers
 * block, because the page invites visitors to register interest rather than naming a
 * ticket price, and claiming a price we do not publish would be wrong.
 *
 * `url` is the canonical expo URL, not necessarily the one being rendered: the home
 * page IS the expo page, since /exhibition renders the same component and
 * canonicalises to /. An Event pointing at a URL Google has folded away would describe
 * a page it will not show.
 */
export function buildExpoEventJsonLd({ event = EXPO_EVENT, url, description, image } = {}) {
  return {
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
      url
    },
    url
  }
}

/** Shared between the runtime injection and the prerender, so one replaces the other. */
export const EXPO_EVENT_JSON_LD_ID = 'expo-event-jsonld'
