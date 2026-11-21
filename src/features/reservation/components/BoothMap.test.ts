import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import BoothMap from './BoothMap.vue'

const i18n = createI18n({ legacy: false, globalInjection: true, locale: 'en', messages: { en: {} }, missingWarn: false, fallbackWarn: false })
const booths = [
  { code: '01', block: 'P', col: 0, row: 1, boothType: 'STANDARD', sizeSqm: 9, status: 'AVAILABLE' },
  { code: 'A101', block: 'A', col: 1, row: 1, boothType: 'PREMIUM', sizeSqm: 9, status: 'AVAILABLE' },
  { code: 'A102', block: 'A', col: 2, row: 1, boothType: 'PREMIUM', sizeSqm: 9, status: 'HELD' },
  { code: 'B101', block: 'B', col: 3, row: 1, boothType: 'PREMIUM', sizeSqm: 9, status: 'SOLD' },
  { code: 'D120', block: 'D', col: 10, row: 10, boothType: 'CORNER', sizeSqm: 9, status: 'AVAILABLE' }
]

function mountMap(props: Record<string, unknown> = {}) {
  return mount(BoothMap, { props: { booths, ...props }, global: { plugins: [i18n] } })
}

describe('BoothMap', () => {
  it('draws every booth with its code', () => {
    const w = mountMap()
    expect(w.findAll('g.booth')).toHaveLength(5)
    expect(w.text()).toContain('D120')
  })

  it('lets a sponsor pick only available booths, up to the package count', async () => {
    const w = mountMap({ selectable: true, maxSelect: 1, selected: [] })
    const g = w.findAll('g.booth')
    await g[2].trigger('click') // HELD: ignored
    await g[3].trigger('click') // SOLD: ignored
    expect(w.emitted('update:selected')).toBeUndefined()
    await g[1].trigger('click')
    expect(w.emitted('update:selected')?.[0]).toEqual([['A101']])
    await w.setProps({ selected: ['A101'] })
    await g[4].trigger('click') // over the limit: ignored
    expect(w.emitted('update:selected')).toHaveLength(1)
    await g[1].trigger('click') // unpick
    expect(w.emitted('update:selected')?.[1]).toEqual([[]])
  })

  it('in admin mode any booth emits pick', async () => {
    const w = mountMap({ adminPick: true })
    await w.findAll('g.booth')[3].trigger('click')
    expect(w.emitted('pick')?.[0]?.[0]).toMatchObject({ code: 'B101' })
  })

  it('greys out booth types the package may not take', async () => {
    const w = mountMap({ selectable: true, maxSelect: 2, selected: [], allowedTypes: ['CORNER', 'STANDARD'] })
    const g = w.findAll('g.booth')
    expect(g[1].classes()).toContain('ineligible') // A101 is PREMIUM
    await g[1].trigger('click')
    expect(w.emitted('update:selected')).toBeUndefined()
    await g[4].trigger('click') // D120 is CORNER
    expect(w.emitted('update:selected')?.[0]).toEqual([['D120']])
  })
})
