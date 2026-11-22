import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import OrganizationLookup from './OrganizationLookup.vue'
import api from '@/shared/api/client'

vi.mock('@/shared/api/client', () => ({ default: { get: vi.fn() } }))

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })

describe('OrganizationLookup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(api.get).mockResolvedValue({ data: [{ id: 'o1', name: 'Abay Steel PLC', city: 'Adama', type: 'SUPPLIER', status: 'PENDING_APPROVAL' }] } as any)
  })

  it('searches after two characters, marks pending profiles and emits the pick', async () => {
    const w = mount(OrganizationLookup, { props: { modelValue: '' }, global: { plugins: [i18n] } })
    await w.find('[data-testid="org-lookup-input"]').setValue('a')
    await vi.advanceTimersByTimeAsync(300)
    expect(api.get).not.toHaveBeenCalled()
    await w.find('[data-testid="org-lookup-input"]').setValue('ab')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/organizations/lookup', { params: { q: 'ab' } })
    expect(w.find('[data-testid="org-lookup-o1"]').text()).toContain('orgLookup.pending')
    await w.find('[data-testid="org-lookup-o1"]').trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['o1'])
    expect(w.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'o1', name: 'Abay Steel PLC' })
    vi.useRealTimers()
  })

  it('offers the organization that already uses the typed email and attaches it on confirm', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 200, data: { id: 'o2', name: 'Kifiya Financial Technologies PLC', status: 'APPROVED', matchedBy: 'email' } } as any)
    const w = mount(OrganizationLookup, { props: { modelValue: '', hints: { name: '', email: '', phone: '' } }, global: { plugins: [i18n] } })
    await w.setProps({ hints: { name: '', email: 'hello@kifiya.com', phone: '' } })
    await vi.advanceTimersByTimeAsync(700)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/organizations/match', { params: { email: 'hello@kifiya.com' } })
    expect(w.find('[data-testid="org-lookup-suggestion"]').text()).toContain('orgLookup.found')
    await w.find('[data-testid="org-lookup-use"]').trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['o2'])
    vi.useRealTimers()
  })
})
