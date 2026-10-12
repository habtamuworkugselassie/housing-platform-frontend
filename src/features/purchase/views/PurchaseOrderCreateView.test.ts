import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { purchaseApi } from '../api/purchase.api'
import PurchaseOrderCreateView from './PurchaseOrderCreateView.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'prop-1' }, query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
}))
vi.mock('@/shared/api/client', () => ({ default: { get: vi.fn() }, mediaUrl: (u: string) => u, sanitizeProfileImageUrl: (u: string) => u }))
vi.mock('../api/purchase.api', () => ({ purchaseApi: { preview: vi.fn(), create: vi.fn() } }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

describe('PurchaseOrderCreateView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.mocked(api.get).mockResolvedValue({
      data: { id: 'prop-1', title: '3BR Apartment', category: 'FOR_SALE', status: 'AVAILABLE', images: [] }
    })
  })

  it('sends a buyer with an open order on the property to that order instead of the form', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 'b1', email: 'b@x.et', firstName: 'A', lastName: 'B', roles: ['BUYER'], scopes: [] }
    vi.mocked(purchaseApi.preview).mockResolvedValue({
      propertyId: 'prop-1',
      listedPrice: 3_200_000,
      currency: 'ETB',
      purchaseType: 'CASH',
      financingAvailable: false,
      financingOffers: [],
      agreementsToSign: [],
      existingOrder: { id: 'order-9', orderNumber: 'PPO-2026-9', status: 'PENDING_SELLER_REVIEW' }
    } as any)

    const w = mount(PurchaseOrderCreateView, {
      global: { plugins: [i18n], stubs: { RouterLink: RouterLinkStub, Breadcrumbs: true } }
    })
    await flushPromises()

    expect(w.find('[data-testid="existing-order"]').text()).toContain('PPO-2026-9')
    expect(w.findComponent(RouterLinkStub).props('to')).toBe('/purchase-orders/order-9')
    expect(w.find('form').exists()).toBe(false)
  })
})
