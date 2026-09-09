/**
 * Public market statistics for the Ethiopia real estate market page.
 *
 * Failure is not exceptional here and is not treated as such: the page's prose stands on
 * its own, and a statistics section that cannot load should simply not appear rather than
 * take an indexable page down with it.
 */
import api from '@/shared/api/client'
import { MARKET_STATISTICS_PATH } from '@/features/marketplace/marketStatisticsView'

export async function getMarketStatistics() {
  const { data } = await api.get(MARKET_STATISTICS_PATH)
  return data
}
