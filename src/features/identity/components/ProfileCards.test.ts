import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import { useAuthStore } from '@/features/auth'
import { authApi } from '@/features/auth/api/auth.api'
import type { User } from '@/features/auth/api/auth.types'
import ProfilePasswordCard from './ProfilePasswordCard.vue'
import ProfilePaymentCard from './ProfilePaymentCard.vue'

vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    changePassword: vi.fn(),
    updatePaymentPreferences: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

function signIn(extra: Partial<User> = {}) {
  useAuthStore().user = {
    id: 'u1',
    email: 'buyer@example.com',
    firstName: 'Abebe',
    lastName: 'Kebede',
    roles: ['BUYER'],
    scopes: [],
    ...extra
  }
}

const mountWith = (c: any) => mount(c, { global: { plugins: [i18n] } })

describe('ProfilePasswordCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('lets a buyer without a password set one without a current password', async () => {
    signIn({ passwordSet: false })
    vi.mocked(authApi.changePassword).mockResolvedValue({} as User)
    const w = mountWith(ProfilePasswordCard)

    expect(w.text()).toContain('Set a password')
    expect(w.find('#current-password').exists()).toBe(false)
    expect(w.text()).toContain('buyer@example.com')

    await w.find('#new-password').setValue('Secret123')
    await w.find('#confirm-password').setValue('Secret123')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(authApi.changePassword).toHaveBeenCalledWith({ currentPassword: undefined, newPassword: 'Secret123' })
    expect(w.find('[data-testid="profile-password-done"]').exists()).toBe(true)
  })

  it('asks for the current password once one is set, and checks the new one locally', async () => {
    signIn({ passwordSet: true })
    const w = mountWith(ProfilePasswordCard)
    expect(w.text()).toContain('Change password')

    await w.find('#current-password').setValue('Old12345')
    await w.find('#new-password').setValue('weak')
    await w.find('#confirm-password').setValue('weak')
    await w.find('form').trigger('submit')
    expect(w.find('[data-testid="profile-password-error"]').text()).toContain('At least 8 characters')

    await w.find('#new-password').setValue('Secret123')
    await w.find('#confirm-password').setValue('Secret124')
    await w.find('form').trigger('submit')
    expect(w.find('[data-testid="profile-password-error"]').text()).toContain('do not match')
    expect(authApi.changePassword).not.toHaveBeenCalled()
  })

  it('treats an unrecorded staff account as having a password', () => {
    signIn({ passwordSet: null, roles: ['REALTOR'] })
    expect(mountWith(ProfilePasswordCard).find('#current-password').exists()).toBe(true)
  })

  it('shows the server message when saving fails', async () => {
    signIn({ passwordSet: true })
    vi.mocked(authApi.changePassword).mockRejectedValue({ response: { data: { message: 'Your current password is not correct' } } })
    const w = mountWith(ProfilePasswordCard)
    await w.find('#current-password').setValue('nope')
    await w.find('#new-password').setValue('Secret123')
    await w.find('#confirm-password').setValue('Secret123')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(w.find('[data-testid="profile-password-error"]').text()).toBe('Your current password is not correct')
  })
})

describe('ProfilePaymentCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts from the saved preference and saves a new method and wallet number', async () => {
    signIn({ preferredPaymentMethod: 'CBE_BIRR', paymentPhone: '+251911223344' })
    vi.mocked(authApi.updatePaymentPreferences).mockResolvedValue({} as User)
    const w = mountWith(ProfilePaymentCard)

    expect((w.find('[data-testid="deposit-method-CBE_BIRR"] input').element as HTMLInputElement).checked).toBe(true)
    expect((w.find('#payment-phone').element as HTMLInputElement).value).toBe('+251911223344')

    await w.find('[data-testid="deposit-method-TELEBIRR"] input').trigger('change')
    await w.find('#payment-phone').setValue(' 0922000000 ')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(authApi.updatePaymentPreferences).toHaveBeenCalledWith({ preferredPaymentMethod: 'TELEBIRR', paymentPhone: '0922000000' })
    expect(w.find('[data-testid="profile-payment-done"]').exists()).toBe(true)
  })

  it('can clear the preference', async () => {
    signIn({ preferredPaymentMethod: 'MPESA' })
    vi.mocked(authApi.updatePaymentPreferences).mockResolvedValue({} as User)
    const w = mountWith(ProfilePaymentCard)
    await w.find('[data-testid="profile-payment-clear"]').trigger('click')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(authApi.updatePaymentPreferences).toHaveBeenCalledWith({ preferredPaymentMethod: null, paymentPhone: null })
  })
})
