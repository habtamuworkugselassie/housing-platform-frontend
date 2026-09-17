import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AgreementReviewPanel from './AgreementReviewPanel.vue'

/** jsdom has no layout, so scroll geometry is stubbed on the scroller element. */
function mountPanel(overrides: Record<string, unknown> = {}) {
  return mount(AgreementReviewPanel, {
    props: {
      title: 'Promise to Purchase Agreement',
      content: '# PROMISE\n\n**Dream Team PLC** and the buyer.',
      version: 1,
      providerName: 'Dream Team PLC',
      accepted: false,
      signatoryName: '',
      scrolledToEnd: false,
      ...overrides
    },
    global: { mocks: { $t: (key: string) => key } }
  })
}

function setGeometry(el: HTMLElement, { scrollHeight, clientHeight, scrollTop }: Record<string, number>) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
  el.scrollTop = scrollTop
}

describe('AgreementReviewPanel', () => {
  it('keeps the signature controls disabled until the text has been read to the end', () => {
    const wrapper = mountPanel()
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).disabled).toBe(true)
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.text()).toContain('purchase.agreement.mustScroll')
  })

  it('reports scrolledToEnd once the scroller reaches the bottom', async () => {
    const wrapper = mountPanel()
    const scroller = wrapper.find('.agreement-body').element as HTMLElement
    setGeometry(scroller, { scrollHeight: 1000, clientHeight: 300, scrollTop: 100 })
    await wrapper.find('.agreement-body').trigger('scroll')
    expect(wrapper.emitted('update:scrolledToEnd')).toBeUndefined()

    setGeometry(scroller, { scrollHeight: 1000, clientHeight: 300, scrollTop: 690 })
    await wrapper.find('.agreement-body').trigger('scroll')
    expect(wrapper.emitted('update:scrolledToEnd')?.[0]).toEqual([true])
  })

  it('enables the controls and forwards the buyer input once read', async () => {
    const wrapper = mountPanel({ scrolledToEnd: true })
    const checkbox = wrapper.find('input[type="checkbox"]')
    const name = wrapper.find('input[type="text"]')
    expect((checkbox.element as HTMLInputElement).disabled).toBe(false)
    await name.setValue('Abebe Kebede')
    expect(wrapper.emitted('update:signatoryName')?.[0]).toEqual(['Abebe Kebede'])
    await checkbox.setValue(true)
    expect(wrapper.emitted('update:accepted')?.[0]).toEqual([true])
  })

  it('shows validation only after the buyer attempted to continue', async () => {
    const wrapper = mountPanel({ scrolledToEnd: true })
    expect(wrapper.text()).not.toContain('purchase.errors.agreementNotAccepted')
    await wrapper.setProps({ attempted: true })
    expect(wrapper.text()).toContain('purchase.errors.agreementNotAccepted')
    expect(wrapper.text()).toContain('purchase.errors.signatoryRequired')
  })

  it('renders the agreement as escaped HTML', () => {
    const wrapper = mountPanel({ content: '# T\n\n<script>x</script> **bold**' })
    const html = wrapper.find('.agreement-body').html()
    expect(html).toContain('<h1>T</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).not.toContain('<script>')
  })

  it('resets the acceptance when a new text arrives', async () => {
    const wrapper = mountPanel({ scrolledToEnd: true, accepted: true })
    await wrapper.setProps({ content: '# v2\n\nchanged' })
    await nextTick()
    expect(wrapper.emitted('update:scrolledToEnd')?.some((e) => e[0] === false)).toBe(true)
    expect(wrapper.emitted('update:accepted')?.some((e) => e[0] === false)).toBe(true)
  })
})
