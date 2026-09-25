import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import AdminPropertyDocumentsView from './AdminPropertyDocumentsView.vue'
import { documentsApi } from '@/features/property/api/documents.api'

vi.mock('@/features/property/api/documents.api', async (orig) => {
  const actual: any = await orig()
  return { ...actual, documentsApi: { ...actual.documentsApi, adminList: vi.fn(), verify: vi.fn(), reject: vi.fn() } }
})

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en }, missingWarn: false, fallbackWarn: false })
const pending = { id: 'd1', propertyId: 'p1', propertyTitle: 'Villa', documentType: 'TITLE_DEED', documentNumber: 'AA/1', status: 'PENDING', fileName: 'deed.pdf', sha256: 'ab' }

function mountView() {
  return mount(AdminPropertyDocumentsView, {
    global: { plugins: [i18n, createPinia()], stubs: { AdminLayout: { template: '<div><slot /></div>' } } }
  })
}

describe('AdminPropertyDocumentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(documentsApi.adminList).mockResolvedValue({ content: [pending], totalPages: 1 } as any)
  })

  it('shows pending documents first and drops one from the list once verified', async () => {
    vi.mocked(documentsApi.verify).mockResolvedValue({ ...pending, status: 'VERIFIED' } as any)
    const w = mountView()
    await flushPromises()
    expect(documentsApi.adminList).toHaveBeenCalledWith('PENDING', 0)
    expect(w.find('[data-testid="admin-doc-d1"]').text()).toContain('Villa')
    await w.find('[data-testid="verify-d1"]').trigger('click')
    await flushPromises()
    expect(documentsApi.verify).toHaveBeenCalledWith('d1', undefined)
    expect(w.find('[data-testid="admin-doc-d1"]').exists()).toBe(false)
  })

  it('shows the server reason when a rejection has no note', async () => {
    vi.mocked(documentsApi.reject).mockRejectedValue({ response: { data: { message: 'Say why the document is rejected' } } })
    const w = mountView()
    await flushPromises()
    await w.find('[data-testid="reject-d1"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Say why the document is rejected')
  })
})
