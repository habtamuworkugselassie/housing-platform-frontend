import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AdminEnquiriesView from './AdminEnquiriesView.vue'
import { enquiryApi } from '@/features/enquiry/api/enquiry.api'

vi.mock('@/features/enquiry/api/enquiry.api', () => ({
  enquiryApi: { adminList: vi.fn(), adminUpdateStatus: vi.fn(), adminCountNew: vi.fn() }
}))

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'e1',
  subjectType: 'PROPERTY',
  propertyId: 'p1',
  organizationId: 'o1',
  organizationName: 'Noah Real Estate',
  subjectTitle: 'Bole 3BR',
  name: 'Abebe Kebede',
  email: 'abebe@example.com',
  phoneNumber: '+251911223344',
  message: 'Still available?',
  status: 'NEW',
  pageUrl: null,
  createdAt: '2026-11-15T10:00:00',
  updatedAt: '2026-11-15T10:00:00',
  ...overrides
})

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

function mountView() {
  return mount(AdminEnquiriesView, {
    global: {
      plugins: [createPinia(), i18n],
      stubs: {
        AdminLayout: { template: '<div><slot /></div>' },
        RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' }
      }
    }
  })
}

describe('AdminEnquiriesView', () => {
  beforeEach(() => {
    vi.mocked(enquiryApi.adminList).mockReset()
    vi.mocked(enquiryApi.adminUpdateStatus).mockReset()
    vi.mocked(enquiryApi.adminList).mockResolvedValue({
      content: [row(), row({ id: 'e2', subjectType: 'ORGANIZATION', propertyId: null, subjectTitle: 'Noah Real Estate', status: 'CLOSED' })],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 25
    })
  })

  it('lists enquiries with links to the listing and the company', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(enquiryApi.adminList).toHaveBeenCalledWith({ status: '', page: 0, size: 25 })
    const first = wrapper.find('[data-testid="enquiry-e1"]')
    expect(first.text()).toContain('Abebe Kebede')
    expect(first.find('a[href="/properties/p1"]').exists()).toBe(true)
    const second = wrapper.find('[data-testid="enquiry-e2"]')
    expect(second.find('a[href="/organizations/o1"]').exists()).toBe(true)
    expect(second.text()).toContain('admin.enquiries.reopen')
  })

  it('marks an enquiry contacted and refilters by status', async () => {
    vi.mocked(enquiryApi.adminUpdateStatus).mockResolvedValue(row({ status: 'CONTACTED' }) as any)
    const wrapper = mountView()
    await flushPromises()
    const buttons = wrapper.find('[data-testid="enquiry-e1"]').findAll('button')
    await buttons[0].trigger('click')
    await flushPromises()
    expect(enquiryApi.adminUpdateStatus).toHaveBeenCalledWith('e1', 'CONTACTED')
    expect(wrapper.find('[data-testid="enquiry-e1"]').text()).toContain('admin.enquiries.statusContacted')

    await wrapper.find('[data-testid="filter-status"]').setValue('NEW')
    await flushPromises()
    expect(enquiryApi.adminList).toHaveBeenLastCalledWith({ status: 'NEW', page: 0, size: 25 })
  })
})
