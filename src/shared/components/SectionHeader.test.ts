import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionHeader from './SectionHeader.vue'

describe('SectionHeader', () => {
  it('renders eyebrow, title with an accent tail, subtitle and the aside note', () => {
    const w = mount(SectionHeader, {
      props: { eyebrow: 'Why', title: 'Key show', accent: 'features.', subtitle: 'Lead.' },
      slots: { aside: 'Note' },
    })
    expect(w.find('h2').text()).toBe('Key show features.')
    expect(w.find('h2 span').text()).toBe('features.')
    expect(w.text()).toContain('Why')
    expect(w.text()).toContain('Lead.')
    expect(w.text()).toContain('Note')
  })
  it('leaves out the accent span and aside when not given', () => {
    const w = mount(SectionHeader, { props: { title: 'Plain' } })
    expect(w.find('h2').text()).toBe('Plain')
    expect(w.find('h2 span').exists()).toBe(false)
  })
})
