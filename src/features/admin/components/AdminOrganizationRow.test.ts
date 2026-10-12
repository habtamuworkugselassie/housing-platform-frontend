import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import AdminOrganizationRow from './AdminOrganizationRow.vue'

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en } })

const base = {
  id: 'o1',
  name: 'Worku PLC',
  type: 'BANK',
  status: 'PENDING_APPROVAL',
  city: '',
  country: '',
  email: 'worku@gmail.com',
  phoneNumbers: [{ countryCode: '+251', number: '911014503' }],
  createdAt: '2026-03-24T10:00:00'
}

const mountRow = (org: Record<string, unknown> = {}) =>
  mount(AdminOrganizationRow, { props: { org: { ...base, ...org }, typeLabel: 'Banks' }, global: { plugins: [i18n] } })

describe('AdminOrganizationRow', () => {
  it('shows a readable status, tappable contacts and no stray comma', () => {
    const w = mountRow()
    expect(w.find('[data-testid="org-status"]').text()).toBe('Pending approval')
    expect(w.find('a[href="mailto:worku@gmail.com"]').exists()).toBe(true)
    expect(w.find('a[href^="tel:+251"]').exists()).toBe(true)
    expect(w.text()).not.toMatch(/(^|\s),\s/)
    expect(w.find('[data-testid="org-docs"]').text()).toBe('No documents uploaded')
  })

  it('offers the actions that fit each status and emits them', async () => {
    const pending = mountRow()
    expect(pending.find('[data-testid="org-approve"]').exists()).toBe(true)
    expect(pending.find('[data-testid="org-reject"]').exists()).toBe(true)
    await pending.find('[data-testid="org-edit"]').trigger('click')
    await pending.find('[data-testid="org-view"]').trigger('click')
    expect(pending.emitted('edit')).toHaveLength(1)
    expect(pending.emitted('view')).toHaveLength(1)

    const approved = mountRow({ status: 'APPROVED' })
    expect(approved.find('[data-testid="org-approve"]').exists()).toBe(false)
    expect(approved.find('[data-testid="org-suspend"]').exists()).toBe(true)

    const suspended = mountRow({ status: 'SUSPENDED' })
    expect(suspended.find('[data-testid="org-reactivate"]').exists()).toBe(true)

    const rejected = mountRow({ status: 'REJECTED' })
    expect(rejected.find('[data-testid="org-approve"]').exists()).toBe(true)
    expect(rejected.find('[data-testid="org-reject"]').exists()).toBe(false)
  })

  it('shows exhibition leads by their email with a marker', () => {
    const w = mountRow({ name: 'Exhibition: tesinhim@gmail.com' })
    expect(w.text()).toContain('Expo interest')
    expect(w.text()).not.toContain('Exhibition:')
  })
})
