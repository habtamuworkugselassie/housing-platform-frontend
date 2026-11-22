import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ExhibitorDirectoryView from './ExhibitorDirectoryView.vue'
import { getExhibitors } from '@/features/exhibition/api/exhibition.api'

vi.mock('@/features/exhibition/api/exhibition.api', () => ({ getExhibitors: vi.fn() }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const mountView = () => mount(ExhibitorDirectoryView, { global: { plugins: [i18n], stubs: { RouterLink: { props: ['to'], template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>' } } } })

describe('ExhibitorDirectoryView', () => {
  beforeEach(() => vi.mocked(getExhibitors).mockReset())

  it('lists confirmed exhibitors by tier with booths, and filters by sector and name', async () => {
    vi.mocked(getExhibitors).mockResolvedValue([
      { organizationId: 'o2', name: 'Zemen Cement', logoUrl: null, organizationType: 'SUPPLIER', city: 'Adama', packageType: 'SILVER', partnerRole: 'SPONSOR', boothCodes: ['B104'] },
      { organizationId: 'o1', name: 'Abay Bank', logoUrl: '/api/v1/uploads/o1/logo.png', organizationType: 'BANK', city: 'Addis Ababa', packageType: 'EXCLUSIVE', partnerRole: 'SPONSOR', boothCodes: ['A101', 'A102'] }
    ] as any)
    const w = mountView()
    await flushPromises()
    const cards = w.findAll('[data-testid^="exhibitor-"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain('Abay Bank')
    expect(cards[0].text()).toContain('exhibition.directory.tier.EXCLUSIVE')
    expect(cards[0].attributes('href')).toBe('/organizations/o1')
    expect(w.find('[data-testid="exhibitor-o2"]').text()).toContain('exhibition.directory.booth')
    await w.find('[data-testid="sector-BANK"]').trigger('click')
    expect(w.findAll('[data-testid^="exhibitor-"]')).toHaveLength(1)
    await w.find('[data-testid="sector-BANK"]').trigger('click')
    await w.find('[data-testid="directory-search"]').setValue('zemen')
    expect(w.findAll('[data-testid^="exhibitor-"]').map((c) => c.text())).toEqual([expect.stringContaining('Zemen Cement')])
  })

  it('invites the first exhibitor when nobody is confirmed yet', async () => {
    vi.mocked(getExhibitors).mockResolvedValue([])
    const w = mountView()
    await flushPromises()
    expect(w.find('[data-testid="directory-empty"]').exists()).toBe(true)
  })
})
