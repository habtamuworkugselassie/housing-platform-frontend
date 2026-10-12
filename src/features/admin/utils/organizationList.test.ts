import { describe, expect, it } from 'vitest'
import { displayName, documentSummary, initials, locationOf, matchesStatus, sortOrganizations, statusMeta } from './organizationList'

describe('organization list helpers', () => {
  it('never shows a lone comma for a missing location', () => {
    expect(locationOf({ city: '', country: '' })).toBe('')
    expect(locationOf({ city: 'Addis Ababa', country: null })).toBe('Addis Ababa')
    expect(locationOf({ city: 'Adama', country: 'Ethiopia' })).toBe('Adama, Ethiopia')
  })

  it('labels statuses in words and treats PENDING_APPROVAL as pending', () => {
    expect(statusMeta('PENDING_APPROVAL').key).toBe('admin.orgList.status.PENDING')
    expect(statusMeta('SPONSORSHIP_PENDING').key).toBe('admin.orgList.status.SPONSORSHIP_PENDING')
    expect(matchesStatus({ status: 'PENDING_APPROVAL' }, 'PENDING')).toBe(true)
    expect(matchesStatus({ status: 'APPROVED' }, 'PENDING')).toBe(false)
    expect(matchesStatus({ status: 'APPROVED' }, '')).toBe(true)
  })

  it('strips the exhibition prefix and marks the lead', () => {
    expect(displayName({ name: 'Exhibition: tesinhim@gmail.com' })).toEqual({ name: 'tesinhim@gmail.com', fromExhibition: true })
    expect(displayName({ name: 'Mazal Trading' })).toEqual({ name: 'Mazal Trading', fromExhibition: false })
    expect(initials('Mazal Trading')).toBe('MT')
    expect(initials('tesinhim@gmail.com')).toBe('T')
  })

  it('summarises uploaded documents and their review', () => {
    expect(documentSummary({})).toEqual({ uploaded: 0, approved: 0, toReview: 0, needsFix: 0 })
    expect(
      documentSummary({
        businessRegistration: '/a.pdf',
        businessRegistrationReviewStatus: 'APPROVED',
        license: '/b.pdf',
        licenseReviewStatus: 'NEEDS_REVISION',
        tinRegistration: '/c.pdf'
      })
    ).toEqual({ uploaded: 3, approved: 1, toReview: 1, needsFix: 1 })
  })

  it('sorts by date either way or by name', () => {
    const list = [
      { name: 'B', createdAt: '2026-01-02' },
      { name: 'Exhibition: a@x.et', createdAt: '2026-03-01' },
      { name: 'C', createdAt: '2026-02-01' }
    ]
    expect(sortOrganizations(list, 'newest').map((o) => o.name)).toEqual(['Exhibition: a@x.et', 'C', 'B'])
    expect(sortOrganizations(list, 'oldest').map((o) => o.name)).toEqual(['B', 'C', 'Exhibition: a@x.et'])
    expect(sortOrganizations(list, 'name').map((o) => o.name)).toEqual(['Exhibition: a@x.et', 'B', 'C'])
  })
})
