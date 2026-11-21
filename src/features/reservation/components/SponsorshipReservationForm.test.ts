import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import SponsorshipReservationForm from './SponsorshipReservationForm.vue'
import { reservationApi } from '@/features/reservation/api/reservation.api'

vi.mock('@/features/reservation/api/reservation.api', async (orig) => {
  const actual = await orig<typeof import('@/features/reservation/api/reservation.api')>()
  return { ...actual, reservationApi: { reserve: vi.fn() } }
})
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const gold = { id: 'p-gold', name: 'Tier 2 · Gold', basePrice: 900000, type: 'GOLD' }

function mountForm(pkg: Record<string, unknown> | null = gold) {
  return mount(SponsorshipReservationForm, { props: { pkg, source: 'test' }, global: { plugins: [createPinia(), i18n] } })
}

describe('SponsorshipReservationForm', () => {
  beforeEach(() => vi.mocked(reservationApi.reserve).mockReset())

  it('shows the chosen package and validates before sending', async () => {
    const w = mountForm()
    expect(w.text()).toContain('Tier 2 · Gold')
    await w.find('[data-testid="reservation-form"]').trigger('submit')
    expect(reservationApi.reserve).not.toHaveBeenCalled()
    expect(w.text()).toContain('reservation.errors.company')
  })

  it('reserves and shows the reference and bank accounts', async () => {
    vi.mocked(reservationApi.reserve).mockResolvedValue({
      reference: 'RSV-K7M2PX', packageName: 'Tier 2 · Gold', amount: 900000, currency: 'ETB', status: 'REQUESTED', email: 'sara@noah.et',
      bankAccounts: [{ bank: 'Commercial Bank of Ethiopia', number: '1000314847467' }], payee: 'Dream Team Trading PLC'
    })
    const w = mountForm()
    await w.find('input[autocomplete="organization"]').setValue('Noah Real Estate')
    await w.find('input[autocomplete="name"]').setValue('Sara Tesfaye')
    await w.find('input[type="email"]').setValue('sara@noah.et')
    await w.find('[data-testid="reservation-form"]').trigger('submit')
    await flushPromises()
    expect(reservationApi.reserve).toHaveBeenCalledWith(expect.objectContaining({ sponsorshipId: 'p-gold', company: 'Noah Real Estate', contactName: 'Sara Tesfaye', email: 'sara@noah.et', locale: 'en', source: 'test' }))
    expect(w.find('[data-testid="reservation-reference"]').text()).toBe('RSV-K7M2PX')
    expect(w.text()).toContain('1000314847467')
    expect(w.emitted('reserved')).toBeTruthy()
  })

  it('refuses to send without a package', async () => {
    const w = mountForm(null)
    await w.find('input[autocomplete="organization"]').setValue('Noah')
    await w.find('input[autocomplete="name"]').setValue('Sara')
    await w.find('input[type="email"]').setValue('sara@noah.et')
    await w.find('[data-testid="reservation-form"]').trigger('submit')
    expect(reservationApi.reserve).not.toHaveBeenCalled()
    expect(w.text()).toContain('reservation.errors.package')
  })
})
