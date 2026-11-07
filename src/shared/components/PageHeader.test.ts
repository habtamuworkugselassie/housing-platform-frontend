import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from './PageHeader.vue'

describe('PageHeader', () => {
  it('renders an h1 by default with eyebrow, accent, subtitle and aside', () => {
    const w = mount(PageHeader, {
      props: { eyebrow: 'Marketplace', title: 'Banks', accent: 'in Ethiopia', subtitle: 'Lead.' },
      slots: { aside: '<span id="count">3 results</span>' },
    })
    expect(w.find('h1').text()).toBe('Banks in Ethiopia')
    expect(w.find('h1 span').text()).toBe('in Ethiopia')
    expect(w.text()).toContain('Marketplace')
    expect(w.text()).toContain('Lead.')
    expect(w.find('#count').exists()).toBe(true)
  })
  it('can render as another heading level', () => {
    const w = mount(PageHeader, { props: { title: 'Plain', as: 'h2' } })
    expect(w.find('h2').text()).toBe('Plain')
    expect(w.find('h1').exists()).toBe(false)
  })
})
