import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PurchaseAccountStep from './PurchaseAccountStep.vue'
import { authApi } from '@/features/auth/api/auth.api'

vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    quickRegister: vi.fn(),
    loginWithGoogle: vi.fn(),
    requestOtpLogin: vi.fn(),
    confirmOtpLogin: vi.fn()
  }
}))
const setAuth = vi.fn()
vi.mock('@/features/auth', () => ({ useAuthStore: () => ({ setAuth }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/properties/p1/purchase' }) }))

const AUTH = { accessToken: 'a', refreshToken: 'r', userId: 'u1', email: 'abebe@example.com', firstName: 'Abebe', lastName: 'Kebede', roles: ['BUYER'], scopes: [] }

/** Empty catalogue: vue-i18n echoes the key back, so assertions can match on keys. */
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false
})

function mountStep() {
  return mount(PurchaseAccountStep, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
      plugins: [createPinia(), i18n]
    }
  })
}

describe('PurchaseAccountStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setAuth.mockReset()
  })

  it('hides the Google button when no client id is configured', () => {
    const wrapper = mountStep()
    expect(wrapper.find('[data-testid="google-button"]').exists()).toBe(false)
  })

  it('validates the quick sign-up and does not call the API while invalid', async () => {
    const wrapper = mountStep()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('purchase.account.errors.nameRequired')
    expect(wrapper.text()).toContain('purchase.errors.phoneRequired')
    expect(authApi.quickRegister).not.toHaveBeenCalled()
  })

  it('registers with normalised phone, signs the store in and reports the details', async () => {
    vi.mocked(authApi.quickRegister).mockResolvedValue(AUTH as any)
    const wrapper = mountStep()
    await wrapper.find('#acc-name').setValue(' Abebe Kebede ')
    await wrapper.find('#acc-phone').setValue('0911223344')
    await wrapper.find('#acc-email').setValue('abebe@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(authApi.quickRegister).toHaveBeenCalledWith({
      fullName: 'Abebe Kebede',
      phoneNumber: '+251911223344',
      email: 'abebe@example.com',
      password: undefined
    })
    expect(setAuth).toHaveBeenCalledWith(AUTH)
    expect(wrapper.emitted('authenticated')?.[0]).toEqual([
      { fullName: 'Abebe Kebede', phone: '+251911223344', email: 'abebe@example.com' }
    ])
  })

  it('switches to the sign-in tab with the number kept when the phone already has an account', async () => {
    vi.mocked(authApi.quickRegister).mockRejectedValue({ response: { status: 409, data: { message: 'already registered' } } })
    const wrapper = mountStep()
    await wrapper.find('#acc-name').setValue('Abebe Kebede')
    await wrapper.find('#acc-phone').setValue('0911223344')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('already registered')
    expect(wrapper.find('#login-phone').exists()).toBe(true)
    // The selector shows +251 and the number box the national part.
    expect((wrapper.find('#login-phone').element as HTMLInputElement).value).toBe('911223344')
    expect(wrapper.find('[data-testid="country-code-button"]').text()).toContain('+251')
  })

  it('signs in with a WhatsApp code in two steps', async () => {
    vi.mocked(authApi.requestOtpLogin).mockResolvedValue()
    vi.mocked(authApi.confirmOtpLogin).mockResolvedValue(AUTH as any)
    const wrapper = mountStep()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await wrapper.find('#login-phone').setValue('0911223344')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(authApi.requestOtpLogin).toHaveBeenCalledWith('+251911223344')

    await wrapper.find('#login-code').setValue('123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(authApi.confirmOtpLogin).toHaveBeenCalledWith('+251911223344', '123456')
    expect(setAuth).toHaveBeenCalledWith(AUTH)
    expect(wrapper.emitted('authenticated')?.[0]).toEqual([
      { phone: '+251911223344', email: 'abebe@example.com', fullName: 'Abebe Kebede' }
    ])
  })
})
