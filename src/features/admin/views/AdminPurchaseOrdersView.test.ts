import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminPurchaseOrdersView from './AdminPurchaseOrdersView.vue'
import { purchaseApi } from '@/features/purchase/api/purchase.api'

vi.mock('@/features/purchase/api/purchase.api', () => ({
  purchaseApi: { adminSearch: vi.fn(), adminStats: vi.fn() }
}))

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  orderNumber: 'PPO-2026-000001',
  status: 'PENDING_SELLER_REVIEW',
  purchaseType: 'BANK_FINANCED',
  property: { id: 'p1', title: 'Bole 3BR', city: 'Addis Ababa', realEstateCompanyName: 'Dream Team PLC' },
  buyer: { id: 'u1', fullName: 'Abebe Kebede', contactPhone: '+251911223344', contactEmail: null },
  pricing: { listedPrice: 8500000, currency: 'ETB' },
  financing: { financedAmount: 6800000, bankName: 'Awash Bank' },
  deposit: { status: 'DUE' },
  createdAt: '2026-09-18T10:00:00',
  ...overrides
})

const pageOf = (content: unknown[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  size: 25,
  number: 0,
  first: true,
  last: true
})

/** Empty catalogue: vue-i18n echoes the key back, so assertions can match on keys. */
const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

function mountView() {
  return mount(AdminPurchaseOrdersView, {
    global: {
      plugins: [createPinia(), i18n],
      stubs: {
        AdminLayout: { template: '<div><slot /></div>' },
        RouterLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' }
      }
    }
  })
}

describe('AdminPurchaseOrdersView', () => {
  beforeEach(() => {
    vi.mocked(purchaseApi.adminSearch).mockReset()
    vi.mocked(purchaseApi.adminStats).mockReset()
    vi.mocked(purchaseApi.adminSearch).mockResolvedValue(pageOf([order(), order({ id: 'o2', orderNumber: 'PPO-2026-000002', purchaseType: 'CASH', financing: null, deposit: null, status: 'COMPLETED' })]) as any)
    vi.mocked(purchaseApi.adminStats).mockResolvedValue({
      total: 2,
      open: 1,
      byStatus: { PENDING_SELLER_REVIEW: 1, COMPLETED: 1 } as any
    })
  })

  it('lists every order with buyer, property, financing and deposit, linking to the details page', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(purchaseApi.adminSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: '', status: '' }),
      { page: 0, size: 25 }
    )
    const rows = wrapper.findAll('[data-testid="order-row"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('PPO-2026-000001')
    expect(rows[0].text()).toContain('Abebe Kebede')
    expect(rows[0].text()).toContain('+251911223344')
    expect(rows[0].text()).toContain('Bole 3BR')
    expect(rows[0].text()).toContain('Dream Team PLC')
    expect(rows[0].text()).toContain('purchase.deposit.status.DUE')
    expect(rows[1].text()).toContain('admin.purchaseOrders.noDeposit')
    expect(rows[0].find('a').attributes('data-to')).toContain('"id":"o1"')
  })

  it('shows status chips from the stats and filters by a chip on click', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="stats"]').text()).toContain('admin.purchaseOrders.total · 2')
    await wrapper.find('[data-testid="stat-COMPLETED"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.adminSearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'COMPLETED' }),
      { page: 0, size: 25 }
    )

    // clicking the active chip clears the filter again
    await wrapper.find('[data-testid="stat-COMPLETED"]').trigger('click')
    await flushPromises()
    expect(purchaseApi.adminSearch).toHaveBeenLastCalledWith(expect.objectContaining({ status: '' }), { page: 0, size: 25 })
  })

  it('submits the search box and type filter together', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('#po-search').setValue('0911')
    await wrapper.find('#po-type').setValue('CASH')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(purchaseApi.adminSearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: '0911', purchaseType: 'CASH' }),
      { page: 0, size: 25 }
    )
  })

  it('shows the empty state and the error state', async () => {
    vi.mocked(purchaseApi.adminSearch).mockResolvedValueOnce(pageOf([]) as any)
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.text()).toContain('admin.purchaseOrders.empty')

    vi.mocked(purchaseApi.adminSearch).mockRejectedValueOnce({ response: { data: { message: 'Forbidden' } } })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('Forbidden')
  })
})
