import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ListingEnquiryForm from './ListingEnquiryForm.vue'
import { enquiryApi } from '../api/enquiry.api'

vi.mock('../api/enquiry.api', () => ({ enquiryApi: { submit: vi.fn() } }))
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }))

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false
})

function mountForm(props: Record<string, unknown> = {}) {
  return mount(ListingEnquiryForm, {
    props: { propertyId: 'p1', subjectTitle: 'Bole 3BR', companyName: 'Noah', ...props },
    global: {
      plugins: [createPinia(), i18n],
      stubs: {
        CountryCodePhoneInput: {
          props: ['countryCode', 'number'],
          emits: ['update:countryCode', 'update:number'],
          template:
            '<input data-testid="phone" :value="number" @input="$emit(\'update:number\', $event.target.value)" />'
        }
      }
    }
  })
}

describe('ListingEnquiryForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(enquiryApi.submit).mockReset()
  })

  it('validates before sending and shows field errors', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(enquiryApi.submit).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('enquiry.errors.name')
    expect(wrapper.text()).toContain('enquiry.errors.email')
    expect(wrapper.text()).toContain('enquiry.errors.message')
  })

  it('sends the property enquiry with a composed phone and shows the thank-you state', async () => {
    vi.mocked(enquiryApi.submit).mockResolvedValue({ id: 'e1', status: 'NEW' } as any)
    const wrapper = mountForm()
    await wrapper.find('input[name="name"]').setValue('Abebe Kebede')
    await wrapper.find('input[name="email"]').setValue('abebe@example.com')
    await wrapper.find('[data-testid="phone"]').setValue('911 223 344')
    await wrapper.find('textarea[name="message"]').setValue('Is this still available? I can visit Saturday.')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(enquiryApi.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId: 'p1',
        organizationId: undefined,
        name: 'Abebe Kebede',
        email: 'abebe@example.com',
        phoneNumber: '+251911223344',
        message: 'Is this still available? I can visit Saturday.',
        locale: 'en'
      })
    )
    expect(wrapper.find('[data-testid="enquiry-sent"]').exists()).toBe(true)
    expect(wrapper.emitted('sent')).toHaveLength(1)
  })

  it('sends an organization enquiry when no property is given', async () => {
    vi.mocked(enquiryApi.submit).mockResolvedValue({ id: 'e2', status: 'NEW' } as any)
    const wrapper = mountForm({ propertyId: '', organizationId: 'o1' })
    await wrapper.find('input[name="name"]').setValue('Sara')
    await wrapper.find('input[name="email"]').setValue('sara@example.com')
    await wrapper.find('textarea[name="message"]').setValue('Do you have units in Ayat?')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(enquiryApi.submit).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'o1', propertyId: undefined, phoneNumber: undefined })
    )
  })

  it('shows a rate-limit message on 429 and keeps the form', async () => {
    vi.mocked(enquiryApi.submit).mockRejectedValue({ response: { status: 429 } })
    const wrapper = mountForm()
    await wrapper.find('input[name="name"]').setValue('Bot')
    await wrapper.find('input[name="email"]').setValue('bot@example.com')
    await wrapper.find('textarea[name="message"]').setValue('hello hello hello')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('enquiry.errors.tooMany')
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
