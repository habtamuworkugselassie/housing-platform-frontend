import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import PurchaseContactStep from './PurchaseContactStep.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

/** Empty catalogue: vue-i18n echoes the key back, so assertions can match on keys. */
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false
})

function mountStep(props: { attempted?: boolean } = {}) {
  return mount(PurchaseContactStep, { props, global: { plugins: [i18n] } })
}

const phoneInput = (w: ReturnType<typeof mountStep>) => w.find('#po-phone')
const codeButton = (w: ReturnType<typeof mountStep>) => w.find('[data-testid="country-code-button"]')

describe('PurchaseContactStep phone with country code', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to +251 and stores the national number as E.164', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep()
    expect(codeButton(wrapper).text()).toContain('+251')

    await phoneInput(wrapper).setValue('911 223 344')
    expect(store.contact.phone).toBe('+251911223344')
    expect(store.contactErrors.phone).toBeUndefined()
    expect(wrapper.text()).toContain('purchase.contact.phoneStoredAs')
  })

  it('drops the Ethiopian trunk 0 so 0911… is not stored as +2510911…', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep()
    await phoneInput(wrapper).setValue('0911223344')
    expect(store.contact.phone).toBe('+251911223344')
  })

  it('switching the country re-prefixes the number', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep()
    await phoneInput(wrapper).setValue('4155551234')
    await codeButton(wrapper).trigger('click')
    await wrapper.find('[data-country-code="+1"]').trigger('click')
    expect(codeButton(wrapper).text()).toContain('+1')
    expect(store.contact.phone).toBe('+14155551234')
  })

  it('pre-fills both controls from a stored international number', async () => {
    const store = usePurchaseOrderFormStore()
    store.contact.phone = '+447911123456'
    const wrapper = mountStep()
    expect(codeButton(wrapper).text()).toContain('+44')
    expect((phoneInput(wrapper).element as HTMLInputElement).value).toBe('7911123456')
  })

  it('follows a later change to the stored number, e.g. from the account step', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep()
    store.contact.phone = '+971501234567'
    await nextTick()
    expect(codeButton(wrapper).text()).toContain('+971')
    expect((phoneInput(wrapper).element as HTMLInputElement).value).toBe('501234567')
  })

  it('re-selects the country when a full international number is pasted into the number box', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep()
    await phoneInput(wrapper).setValue('+1 415 555 1234')
    await nextTick()
    expect(codeButton(wrapper).text()).toContain('+1')
    expect((phoneInput(wrapper).element as HTMLInputElement).value).toBe('4155551234')
    expect(store.contact.phone).toBe('+14155551234')
  })

  it('an empty number still triggers the required error once attempted', async () => {
    const store = usePurchaseOrderFormStore()
    const wrapper = mountStep({ attempted: true })
    await phoneInput(wrapper).setValue('')
    expect(store.contact.phone).toBe('')
    expect(wrapper.text()).toContain('purchase.errors.phoneRequired')
    expect(phoneInput(wrapper).attributes('aria-invalid')).toBe('true')
  })
})
