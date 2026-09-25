import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import PropertyDocumentsPanel from './PropertyDocumentsPanel.vue'
import { documentsApi } from '../api/documents.api'

vi.mock('../api/documents.api', async (orig) => {
  const actual: any = await orig()
  return { ...actual, documentsApi: { ...actual.documentsApi, list: vi.fn(), upload: vi.fn(), remove: vi.fn() } }
})

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })
const doc = (o: Record<string, unknown> = {}) => ({
  id: 'd1',
  propertyId: 'p1',
  documentType: 'TITLE_DEED',
  documentTypeLabel: 'Title deed',
  documentNumber: 'AA/1234',
  issuingAuthority: null,
  issuedOn: null,
  description: null,
  fileName: 'deed.pdf',
  contentType: 'application/pdf',
  sizeBytes: 10,
  sha256: 'ab',
  status: 'PENDING',
  reviewNote: null,
  reviewedAt: null,
  createdAt: '2026-09-25T10:00:00',
  ...o
})

describe('PropertyDocumentsPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists documents with their review status and hides delete once verified', async () => {
    vi.mocked(documentsApi.list).mockResolvedValue([doc(), doc({ id: 'd2', status: 'VERIFIED', documentType: 'LEASE_AGREEMENT' }), doc({ id: 'd3', status: 'REJECTED', reviewNote: 'Blurry scan' })] as any)
    const w = mount(PropertyDocumentsPanel, { props: { propertyId: 'p1' }, global: { plugins: [i18n] } })
    await flushPromises()
    expect(w.find('[data-testid="doc-d1"]').text()).toContain('Awaiting review')
    expect(w.find('[data-testid="doc-d2"]').text()).toContain('Land lease contract')
    expect(w.find('[data-testid="doc-d2"]').text()).not.toContain('Delete')
    expect(w.find('[data-testid="doc-d3"]').text()).toContain('Rejected: Blurry scan')
  })

  it('uploads the chosen file with its type and number', async () => {
    vi.mocked(documentsApi.list).mockResolvedValue([])
    vi.mocked(documentsApi.upload).mockResolvedValue(doc() as any)
    const w = mount(PropertyDocumentsPanel, { props: { propertyId: 'p1' }, global: { plugins: [i18n] } })
    await flushPromises()
    await w.find('[data-testid="doc-type"]').setValue('LEASE_AGREEMENT')
    const file = new File(['%PDF'], 'lease.pdf', { type: 'application/pdf' })
    const input = w.find('[data-testid="doc-file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await w.find('[data-testid="doc-upload"]').trigger('click')
    await flushPromises()
    expect(documentsApi.upload).toHaveBeenCalledWith('p1', file, expect.objectContaining({ documentType: 'LEASE_AGREEMENT' }))
    expect(w.find('[data-testid="doc-d1"]').exists()).toBe(true)
  })

  it('refuses files over 15 MB before uploading', async () => {
    vi.mocked(documentsApi.list).mockResolvedValue([])
    const w = mount(PropertyDocumentsPanel, { props: { propertyId: 'p1' }, global: { plugins: [i18n] } })
    await flushPromises()
    const big = new File(['x'], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 16 * 1024 * 1024 })
    const input = w.find('[data-testid="doc-file"]')
    Object.defineProperty(input.element, 'files', { value: [big] })
    await input.trigger('change')
    expect(w.text()).toContain('larger than 15 MB')
    expect(w.find('[data-testid="doc-upload"]').attributes('disabled')).toBeDefined()
  })
})
