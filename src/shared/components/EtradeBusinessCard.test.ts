import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import EtradeBusinessCard from './EtradeBusinessCard.vue'
import type { EtradeBusinessDetails } from '@/shared/api/etrade'
import { etradeErrorMessage, normalizeTin } from '@/shared/api/etrade'

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

/** Shape of GET /api/v1/etrade/businesses/0081723672 (photo omitted). */
const details: EtradeBusinessDetails = {
  tin: '0081723672',
  businessName: 'FIREW WONDE BELAY',
  businessNameAmharic: 'ፍሬው ወንዴ በላይ',
  legalCondition: { code: '1', name: 'Sole Proprietorship', nameAmharic: 'ግለሰብ ነጋዴ' },
  registrationNumber: 'AA/LK/14/1/3631426/2016',
  registrationDate: '2022-12-01',
  paidUpCapital: 500,
  associates: [{ name: 'FIREW WONDE', nameAmharic: 'ፍሬው ወንዴ' }],
  businesses: [
    {
      id: '1e18bf2a-6532-4249-b937-65ffbeb4cb54',
      tradeName: 'FIREW WONDE BELAY',
      licenseNumber: 'YK/AA/14/672/5990336/2016',
      dateRegistered: '2024-08-30',
      renewedFrom: '2026-07-08',
      renewedTo: '2027-07-07',
      licenseStatus: 'ACTIVE',
      sectors: [{ code: 62222, description: 'Retail trade in beverage products' }]
    },
    {
      id: 'old',
      tradeName: 'OLD SHOP',
      licenseNumber: 'OLD/1',
      renewedToRaw: 'Data not available',
      licenseStatus: 'UNKNOWN',
      sectors: []
    }
  ],
  hasActiveLicense: true,
  fetchedAt: '2026-10-04T09:00:00Z',
  sourceUrl: 'https://etrade.gov.et/business-license-checker?tin=0081723672'
}

describe('EtradeBusinessCard', () => {
  it('renders the registration, its licences and their status', () => {
    const w = mount(EtradeBusinessCard, { props: { details }, global: { plugins: [i18n] } })
    expect(w.find('[data-testid="etrade-business-name"]').text()).toBe('FIREW WONDE BELAY')
    expect(w.find('[data-testid="etrade-reg-no"]').text()).toBe('AA/LK/14/1/3631426/2016')
    expect(w.text()).toContain('Sole Proprietorship (1)')
    expect(w.text()).toContain('FIREW WONDE')
    expect(w.find('[data-testid="etrade-license-summary"]').text()).toBe('Active licence')
    const licences = w.findAll('[data-testid="etrade-license"]')
    expect(licences).toHaveLength(2)
    expect(licences[0].text()).toContain('YK/AA/14/672/5990336/2016')
    expect(licences[0].text()).toContain('Active')
    expect(licences[0].text()).toContain('62222 Retail trade in beverage products')
    expect(licences[1].text()).toContain('Data not available')
    expect(licences[1].text()).toContain('Unknown')
    expect(w.find('a[href="https://etrade.gov.et/business-license-checker?tin=0081723672"]').exists()).toBe(true)
    expect(w.find('[data-testid="etrade-checks"]').exists()).toBe(false)
  })

  it('shows match flags when verification checks are supplied', () => {
    const w = mount(EtradeBusinessCard, {
      props: {
        details,
        checks: { nameMatches: true, licenseNumberMatches: false, registrationNumberMatches: null, licenseActive: true }
      },
      global: { plugins: [i18n] }
    })
    const checks = w.find('[data-testid="etrade-checks"]').text()
    expect(checks).toContain('✓ Name')
    expect(checks).toContain('✗ Licence number')
    expect(checks).toContain('Registration number: not provided')
    expect(checks).toContain('✓ Licence active')
  })

  it('tells a trader without licences so', () => {
    const w = mount(EtradeBusinessCard, {
      props: { details: { ...details, businesses: [], hasActiveLicense: false } },
      global: { plugins: [i18n] }
    })
    expect(w.text()).toContain('No business licence is recorded under this TIN.')
    expect(w.find('[data-testid="etrade-license-summary"]').text()).toBe('No active licence')
  })
})

describe('etrade api helpers', () => {
  it('normalizes TINs the same way the backend does', () => {
    expect(normalizeTin(' 0081-723 672 ')).toBe('0081723672')
    expect(normalizeTin('0081723672')).toBe('0081723672')
    expect(normalizeTin('123')).toBeNull()
    expect(normalizeTin('')).toBeNull()
    expect(normalizeTin(undefined)).toBeNull()
  })

  it('maps HTTP failures to user-facing messages', () => {
    const t = (k: string) => k
    expect(etradeErrorMessage({ response: { status: 404 } }, t)).toBe('etrade.notFound')
    expect(etradeErrorMessage({ response: { status: 502 } }, t)).toBe('etrade.unavailable')
    expect(etradeErrorMessage({ response: { status: 403 } }, t)).toBe('etrade.forbidden')
    expect(etradeErrorMessage({ response: { status: 400, data: { message: 'TIN must be exactly 10 digits' } } }, t)).toBe(
      'TIN must be exactly 10 digits'
    )
    expect(etradeErrorMessage(new Error('network'), t)).toBe('etrade.failed')
  })
})
