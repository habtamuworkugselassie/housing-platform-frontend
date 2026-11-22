import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ExhibitorPortalView from './ExhibitorPortalView.vue'
import { exhibitorApi } from '../api/exhibitor.api'
import { reservationApi } from '@/features/reservation/api/reservation.api'

vi.mock('../api/exhibitor.api', async (orig) => {
  const actual = await orig<typeof import('../api/exhibitor.api')>()
  return { ...actual, exhibitorApi: { myOrganization: vi.fn(), updateProfile: vi.fn(), upload: vi.fn(), remove: vi.fn(), pendingMedia: vi.fn(), review: vi.fn() } }
})
vi.mock('@/features/reservation/api/reservation.api', async (orig) => {
  const actual = await orig<typeof import('@/features/reservation/api/reservation.api')>()
  return { ...actual, reservationApi: { mine: vi.fn() } }
})

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const org = (o: Record<string, unknown> = {}) => ({
  id: 'o1', name: 'Abay Steel PLC', type: 'SUPPLIER', status: 'APPROVED', address: null, city: 'Addis Ababa', country: 'Ethiopia', description: 'Steel for builders',
  email: 'hana@abay.et', website: null, facebookUrl: null, instagramUrl: null, linkedinUrl: null, twitterUrl: null, youtubeUrl: null,
  phoneNumbers: [{ countryCode: '+251', number: '0911000000' }], logoUrl: null, sponsorshipType: 'SILVER',
  media: [
    { id: 'm1', url: '/api/v1/uploads/organizations/o1/logo.png', caption: null, displayOrder: 0, isPrimary: true, mediaKind: 'LOGO', reviewStatus: 'PENDING', reviewNote: null },
    { id: 'm2', url: '/api/v1/uploads/organizations/o1/a.jpg', caption: null, displayOrder: 1, isPrimary: false, mediaKind: 'IMAGE', reviewStatus: 'REJECTED', reviewNote: 'Too blurry' }
  ],
  ...o
})
const mountView = () => mount(ExhibitorPortalView, { global: { plugins: [createPinia(), i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } } })

describe('ExhibitorPortalView', () => {
  beforeEach(() => {
    vi.mocked(exhibitorApi.myOrganization).mockReset()
    vi.mocked(exhibitorApi.updateProfile).mockReset()
    vi.mocked(exhibitorApi.upload).mockReset()
    vi.mocked(reservationApi.mine).mockResolvedValue([
      { reference: 'RSV-K7M2PX', packageName: 'Tier 3 · Silver', packageType: 'SILVER', amount: 450000, amountPaid: 75000, currency: 'ETB', status: 'DEPOSIT_PAID', boothCodes: ['B104'], boothsIncluded: 1, email: 'hana@abay.et', paidAt: null }
    ])
  })

  it('shows the organization, its reservation and the review state of each upload', async () => {
    vi.mocked(exhibitorApi.myOrganization).mockResolvedValue(org() as any)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="exhibitor-header"]').text()).toContain('Abay Steel PLC')
    expect(w.find('[data-testid="org-status"]').text()).toContain('exhibitor.live')
    expect(w.find('[data-testid="reservations"]').text()).toContain('RSV-K7M2PX')
    expect(w.find('[data-testid="reservations"]').text()).toContain('booth.picked')
    expect(w.find('[data-testid="media-m1"] [data-testid="review-chip"]').text()).toBe('exhibitor.review.PENDING')
    expect(w.find('[data-testid="media-m2"]').text()).toContain('Too blurry')
    expect((w.find('[data-testid="description"]').element as HTMLTextAreaElement).value).toBe('Steel for builders')
  })

  it('saves the profile with the phone wrapped the way the API expects', async () => {
    vi.mocked(exhibitorApi.myOrganization).mockResolvedValue(org() as any)
    vi.mocked(exhibitorApi.updateProfile).mockResolvedValue(org({ description: 'Updated' }) as any)
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="description"]').setValue('Updated')
    await w.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(exhibitorApi.updateProfile).toHaveBeenCalledWith('o1', expect.objectContaining({ name: 'Abay Steel PLC', type: 'SUPPLIER', description: 'Updated', phoneNumbers: [{ countryCode: '+251', number: '0911000000' }] }))
    expect(w.find('[data-testid="notice"]').text()).toBe('exhibitor.profileSaved')
  })

  it('uploads a picked logo as LOGO', async () => {
    vi.mocked(exhibitorApi.myOrganization).mockResolvedValue(org() as any)
    vi.mocked(exhibitorApi.upload).mockResolvedValue(org() as any)
    const w = mountView()
    await flushPromises()
    const input = w.find('[data-testid="logo-input"]')
    const file = new File([new Uint8Array([1, 2, 3])], 'logo.png', { type: 'image/png' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(exhibitorApi.upload).toHaveBeenCalledWith('o1', [file], 'LOGO')
  })

  it('explains what to do when no organization is linked yet', async () => {
    vi.mocked(exhibitorApi.myOrganization).mockResolvedValue(null)
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="no-organization"]').exists()).toBe(true)
  })
})
