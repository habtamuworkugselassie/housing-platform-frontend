/**
 * Currency utility functions for formatting and displaying currencies
 */

export const CURRENCIES = {
  ETB: {
    code: 'ETB',
    name: 'Birr',
    // The ብ glyph glued to the digits read like a minus sign at a glance
    // ("ብ2,500,000.00" ~ "-2,500,000"). The ISO code with a space is unambiguous.
    symbol: 'ETB',
    symbolPosition: 'before' // 'before' or 'after'
  },
  USD: {
    code: 'USD',
    name: 'Dollar',
    symbol: '$',
    symbolPosition: 'before'
  }
}

/**
 * Format a price with currency symbol
 * @param {number|string} price - The price to format
 * @param {string} currency - Currency code (ETB or USD)
 * @param {object} options - Formatting options
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = 'ETB', options = {}) {
  if (price === null || price === undefined || price === '') {
    return '0'
  }

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.ETB
  const {
    showSymbol = true,
    // Listing prices are whole-birr amounts in the millions; trailing .00 is noise.
    showDecimals = false,
    locale = 'en-US'
  } = options

  // Format number with locale-specific formatting
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(price)

  if (!showSymbol) {
    return formattedNumber
  }

  // Add currency symbol
  // Alphabetic symbols (ETB) get a separating space; glyphs ($) stay attached.
  const sep = /[A-Za-z]$/.test(currencyInfo.symbol) ? ' ' : ''
  if (currencyInfo.symbolPosition === 'before') {
    return `${currencyInfo.symbol}${sep}${formattedNumber}`
  } else {
    return `${formattedNumber} ${currencyInfo.symbol}`
  }
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency = 'ETB') {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.ETB
  return currencyInfo.symbol
}

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export function getCurrencyName(currency = 'ETB') {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.ETB
  return currencyInfo.name
}

/**
 * Get all available currencies
 * @returns {Array} Array of currency objects
 */
export function getAvailableCurrencies() {
  return Object.values(CURRENCIES)
}
