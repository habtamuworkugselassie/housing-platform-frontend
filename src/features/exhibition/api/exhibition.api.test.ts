import { beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn()
const get = vi.fn()
vi.mock('@/shared/api/client', () => ({
  default: { post: (...a: unknown[]) => post(...a), get: (...a: unknown[]) => get(...a), defaults: { baseURL: '/api/v1' } },
}))

import { exhibitionApi } from './exhibition.api'

describe('live broadcast manage key', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
    sessionStorage.clear()
  })

  it('remembers the key from the go-live response and sends it on broadcaster calls', async () => {
    post.mockResolvedValueOnce({ data: { id: 'b1', status: 'REQUESTED', manageKey: 'secret-key' } })
    await exhibitionApi.requestGoLive({ name: 'Abebe', title: 'Tour' })

    get.mockResolvedValueOnce({ data: { url: 'wss://x', token: 't', room: 'r' } })
    await exhibitionApi.getPublishToken('b1')
    expect(get).toHaveBeenCalledWith('/exhibition/live/b1/publish-token', {
      headers: { 'X-Broadcast-Key': 'secret-key' },
    })

    post.mockResolvedValueOnce({ data: {} })
    await exhibitionApi.endBroadcast('b1')
    expect(post).toHaveBeenLastCalledWith('/exhibition/live/b1/end', null, {
      headers: { 'X-Broadcast-Key': 'secret-key' },
    })
  })

  it('puts the key in the beacon URL, since beacons cannot carry headers', async () => {
    post.mockResolvedValueOnce({ data: { id: 'b2', status: 'REQUESTED', manageKey: 'k/2' } })
    await exhibitionApi.requestGoLive({ name: 'Abebe', title: 'Tour' })

    const beacon = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true })
    exhibitionApi.endBroadcastBeacon('b2')
    expect(beacon.mock.calls[0][0]).toBe('/api/v1/exhibition/live/b2/end?key=k%2F2')
  })

  it('sends no key header for streams it did not create', async () => {
    get.mockResolvedValueOnce({ data: [] })
    await exhibitionApi.listCohostRequests('someone-else')
    expect(get).toHaveBeenCalledWith('/exhibition/live/someone-else/cohost/requests', {
      headers: undefined,
    })
  })
})
