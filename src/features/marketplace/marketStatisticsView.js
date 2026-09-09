/**
 * Turns the market-statistics payload into the rows the page displays.
 *
 * Plain ESM with no imports, for the same reason `marketOverviewContent.js` is: the
 * build-time prerenderer imports this module directly under Node, so the figures baked
 * into the static HTML and the figures Vue renders are produced by one function from one
 * payload. Formatting logic that existed twice would drift, and a prerendered page whose
 * numbers disagree with the rendered page is cloaking however innocently it happened.
 *
 * Two deliberate omissions, both about not publishing a number that looks meaningful and
 * is not:
 *
 * 1. **No rental prices.** A listing carries `price_etb` with no rental period anywhere on
 *    the entity, so a rental median could be pooling monthly asking rents with annual
 *    ones. Rental *counts* are unambiguous and are shown; rental *prices* are not, and
 *    will not be until listings record a period.
 * 2. **No figure from a thin bucket.** The API returns null for anything under its
 *    reported minimum sample size, and null renders as a plain "too few listings" rather
 *    than being hidden — a reader can then see the coverage honestly instead of wondering
 *    why a row is blank.
 */

/** Path appended to the API base (`VITE_API_BASE_URL`, e.g. https://host/api/v1). */
export const MARKET_STATISTICS_PATH = '/public/market-statistics'

/** Global the prerenderer seeds so the first paint has figures and Vue does not flash. */
export const MARKET_STATISTICS_SEED_KEY = '__ETHIO_MARKET_STATISTICS__'

const NOT_ENOUGH = 'Too few listings'

function birr(value) {
  if (value == null) return NOT_ENOUGH
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0
  }).format(value)
}

function count(value) {
  return new Intl.NumberFormat('en').format(value ?? 0)
}

function percent(share) {
  return `${Math.round((share ?? 0) * 1000) / 10}%`
}

/**
 * Turns READY_TO_MOVE into "Ready to move", and leaves everything else alone.
 *
 * Only enum-shaped labels are rewritten. City labels come from what a company typed into
 * its listing and are already cased as a place name — lowercasing "Addis Ababa" to
 * re-capitalise it produced "Addis ababa", which looks like a bug on the page because it
 * is one.
 */
function humanise(label) {
  if (!label) return ''
  if (!/^[A-Z0-9_]+$/.test(label)) return label
  const words = label.toLowerCase().split('_').join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function categoryOf(payload, name) {
  return (payload?.byCategory || []).find((entry) => entry.category === name) || null
}

function breakdownRows(entries) {
  return (entries || [])
    .filter((entry) => entry.listingCount > 0)
    .map((entry) => ({
      label: humanise(entry.label),
      listings: count(entry.listingCount),
      medianPrice: birr(entry.medianPrice),
      medianPricePerSqm: birr(entry.medianPricePerSqm),
      measured: count(entry.measuredListingCount)
    }))
}

/**
 * The full view model, or null when there is nothing worth showing.
 *
 * Returns null rather than an empty shell when no listing is priced: a statistics section
 * consisting of "Too few listings" repeated eleven times is worse than no section, and the
 * page's prose stands on its own.
 */
export function buildMarketStatisticsView(payload) {
  const forSale = categoryOf(payload, 'FOR_SALE')
  const forRental = categoryOf(payload, 'FOR_RENTAL')
  if (!forSale || !forSale.pricedListingCount) return null

  const headline = [
    {
      key: 'median',
      label: 'Median asking price, for sale',
      value: birr(forSale.medianPrice),
      note: `across ${count(forSale.pricedListingCount)} priced listings`
    },
    {
      key: 'range',
      label: 'Middle half of asking prices',
      value:
        forSale.lowerQuartilePrice == null || forSale.upperQuartilePrice == null
          ? NOT_ENOUGH
          : `${birr(forSale.lowerQuartilePrice)} – ${birr(forSale.upperQuartilePrice)}`,
      note: 'the 25th to 75th percentile'
    },
    {
      key: 'persqm',
      label: 'Median asking price per m²',
      value: birr(forSale.medianPricePerSqm),
      note: `across ${count(forSale.measuredListingCount)} listings that state a floor area`
    },
    {
      key: 'supply',
      label: 'Live listings',
      value: count(payload.totalListings),
      note: forRental
        ? `${count(forSale.listingCount)} for sale, ${count(forRental.listingCount)} to rent`
        : `${count(forSale.listingCount)} for sale`
    }
  ]

  const tables = []
  const typeRows = breakdownRows(forSale.byType)
  if (typeRows.length) {
    tables.push({
      id: 'by-property-type',
      caption: 'Asking prices for sale, by property type',
      columns: ['Property type', 'Listings', 'Median asking price', 'Median per m²'],
      rows: typeRows.map((row) => [row.label, row.listings, row.medianPrice, row.medianPricePerSqm])
    })
  }

  const cityRows = breakdownRows(forSale.byCity)
  if (cityRows.length > 1) {
    tables.push({
      id: 'by-city',
      caption: 'Asking prices for sale, by city',
      columns: ['City', 'Listings', 'Median asking price', 'Median per m²'],
      rows: cityRows.map((row) => [row.label, row.listings, row.medianPrice, row.medianPricePerSqm])
    })
  }

  const mix = (payload.inventoryMix || []).filter((entry) => entry.listingCount > 0)
  if (mix.length) {
    tables.push({
      id: 'inventory-mix',
      caption: 'What is on the market, by property type',
      columns: ['Property type', 'Listings', 'Share of listings'],
      rows: mix.map((entry) => [humanise(entry.label), count(entry.listingCount), percent(entry.share)])
    })
  }

  return {
    id: 'listings-data',
    heading: 'What listings on this platform are asking',
    standfirst:
      'Computed from live listings on Ethio Build Connect. These are asking prices published by' +
      ' registered companies and agents — not sale prices, and not a market index — and they' +
      ' change as listings do.',
    generatedOn: payload.generatedOn,
    minimumSampleSize: payload.minimumSampleSize,
    headline,
    tables,
    footnote:
      `Medians rather than averages, because asking prices are skewed by a small number of` +
      ` high-value properties. A figure is withheld where fewer than ${payload.minimumSampleSize}` +
      ` listings in that row publish a price. Rental asking prices are not shown: listings do not` +
      ` record a rental period, so a median would mix monthly and annual figures.`
  }
}
