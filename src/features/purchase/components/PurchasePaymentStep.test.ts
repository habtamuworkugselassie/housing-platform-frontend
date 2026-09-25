import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import PurchasePaymentStep from './PurchasePaymentStep.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

function withDeposit(checkoutAvailable = true) {
  const store = usePurchaseOrderFormStore()
  store.preview = {
    propertyId: 'prop-1',
    listedPrice: 8_500_000,
    currency: 'ETB',
    purchaseType: 'CASH',
    financingAvailable: false,
    financingOffers: [],
    agreementsToSign: [],
    deposit: {
      amount: 85_000,
      currency: 'ETB',
      checkoutAvailable,
      paymentMethods: ['TELEBIRR', 'CBE_BIRR', 'MPESA', 'AWASH_BIRR', 'CARD']
    }
  }
  return store
}

describe('PurchasePaymentStep', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the deposit and one choice per method, and records the pick', async () => {
    const store = withDeposit()
    const wrapper = mount(PurchasePaymentStep, { global: { plugins: [i18n] } })
    expect(wrapper.find('[data-testid="deposit-quote"]').text()).toContain('85,000')
    const text = wrapper.text()
    for (const label of ['telebirr', 'CBE Birr', 'M-Pesa', 'Awash Birr', 'Card or other method']) {
      expect(text).toContain(label)
    }
    expect(text).not.toContain('Cash purchase')
    await wrapper.find('[data-testid="deposit-method-TELEBIRR"] input').setValue(true)
    expect(store.payment.method).toBe('TELEBIRR')
  })

  it('asks for a method after the buyer tried to continue', () => {
    withDeposit()
    const wrapper = mount(PurchasePaymentStep, { props: { attempted: true }, global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('Choose how you will pay the deposit.')
  })

  it('explains when online payment is not configured', () => {
    withDeposit(false)
    const wrapper = mount(PurchasePaymentStep, { global: { plugins: [i18n] } })
    expect(wrapper.find('[data-testid="deposit-method-TELEBIRR"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Online payment is not available yet')
  })
})
