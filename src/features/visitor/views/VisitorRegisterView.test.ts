import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import VisitorRegisterView from './VisitorRegisterView.vue'
import { visitorApi } from '@/features/visitor/api/visitor.api'

vi.mock('@/features/visitor/api/visitor.api', async (orig) => {
  const actual = await orig<typeof import('@/features/visitor/api/visitor.api')>()
  return { ...actual, visitorApi: { register: vi.fn(), badge: vi.fn() }, visitorQrUrl: (c: string) => `/api/v1/visitors/${c}/qr.png` }
})
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: { src: 'flyer' }, params: {} }), useRouter: () => ({ push: vi.fn() }) }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

function mountView() {
  return mount(VisitorRegisterView, {
    global: { plugins: [createPinia(), i18n], stubs: { LocaleSwitcher: true, RouterLink: { template: '<a><slot /></a>' } } }
  })
}

describe('VisitorRegisterView', () => {
  beforeEach(() => vi.mocked(visitorApi.register).mockReset())

  it('validates before sending', async () => {
    const w = mountView()
    await w.find('[data-testid="visitor-form"]').trigger('submit')
    expect(visitorApi.register).not.toHaveBeenCalled()
    expect(w.text()).toContain('visitor.errors.name')
  })

  it('registers and shows the badge with its code and QR', async () => {
    vi.mocked(visitorApi.register).mockResolvedValue({
      code: 'EBC-K7M2PX', fullName: 'Sara Tesfaye', organization: null, visitorType: 'INVESTOR', status: 'REGISTERED', locale: 'en',
      checkedInAt: null, createdAt: null, badgeUrl: 'https://ethiobuildconnect.et/badge/EBC-K7M2PX', qrUrl: '/api/v1/visitors/EBC-K7M2PX/qr.png', alreadyRegistered: false
    })
    const w = mountView()
    await w.find('#v-name').setValue('Sara Tesfaye')
    await w.find('#v-email').setValue('sara@example.com')
    await w.find('[data-testid="visitor-type"]').setValue('INVESTOR')
    await w.find('[data-testid="visitor-form"]').trigger('submit')
    await flushPromises()
    expect(visitorApi.register).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Sara Tesfaye', email: 'sara@example.com', visitorType: 'INVESTOR', locale: 'en', source: 'flyer' }))
    expect(w.find('[data-testid="badge-code"]').text()).toBe('EBC-K7M2PX')
    expect(w.find('[data-testid="visitor-badge"] img').attributes('src')).toContain('EBC-K7M2PX/qr.png')
  })

  it('tells the visitor when the email was already registered', async () => {
    vi.mocked(visitorApi.register).mockResolvedValue({
      code: 'EBC-AAAAAA', fullName: 'Sara', organization: null, visitorType: 'OTHER', status: 'REGISTERED', locale: 'en',
      checkedInAt: null, createdAt: null, badgeUrl: '', qrUrl: '', alreadyRegistered: true
    })
    const w = mountView()
    await w.find('#v-name').setValue('Sara')
    await w.find('#v-email').setValue('sara@example.com')
    await w.find('[data-testid="visitor-form"]').trigger('submit')
    await flushPromises()
    expect(w.text()).toContain('visitor.alreadyRegistered')
  })
})
