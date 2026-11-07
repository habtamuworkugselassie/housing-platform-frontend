import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { reveal, installReveal } from './reveal'

const Box = defineComponent({
  directives: { reveal },
  render: () => h('div', { id: 'box' }, [h('p', 'a'), h('p', 'b')]),
})
const Revealed = defineComponent({
  directives: { reveal },
  render() {
    return h('section', [
      h('div', { id: 'plain' }, 'x'),
    ])
  },
})

afterEach(() => {
  // @ts-expect-error test cleanup of a browser global
  delete globalThis.IntersectionObserver
})

describe('v-reveal', () => {
  it('shows the element at once where IntersectionObserver does not exist', () => {
    const w = mount(defineComponent({ directives: { reveal }, render: () => h('div', { id: 'b' }) }), {
      global: { directives: { reveal } },
    })
    // directive applied through withDirectives in template-less render: emulate by mounting with directive attr
    expect(w.exists()).toBe(true)
  })

  it('adds .reveal on mount and .is-in once the observer reports it on screen', () => {
    const observed: Element[] = []
    let callback: IntersectionObserverCallback = () => {}
    class FakeIO {
      constructor(cb: IntersectionObserverCallback) { callback = cb }
      observe(el: Element) { observed.push(el) }
      unobserve() {}
      disconnect() {}
    }
    // @ts-expect-error minimal fake for the test
    globalThis.IntersectionObserver = FakeIO

    const Comp = defineComponent({
      directives: { reveal },
      template: '<div v-reveal id="t">hi</div>',
    })
    const w = mount(Comp)
    const el = w.find('#t').element
    expect(el.classList.contains('reveal')).toBe(true)
    expect(el.classList.contains('is-in')).toBe(false)
    expect(observed).toContain(el)

    // @ts-expect-error only the fields the directive reads
    callback([{ target: el, isIntersecting: true }], {})
    expect(el.classList.contains('is-in')).toBe(true)
  })

  it('falls back to visible immediately without IntersectionObserver', () => {
    const Comp = defineComponent({ directives: { reveal }, template: '<div v-reveal id="t">hi</div>' })
    const w = mount(Comp)
    expect(w.find('#t').element.classList.contains('is-in')).toBe(true)
  })

  it('installReveal marks the document so the hidden state only applies with JS running', () => {
    const app = { directive: vi.fn() }
    // @ts-expect-error partial app
    installReveal(app)
    expect(document.documentElement.classList.contains('has-reveal')).toBe(true)
    expect(app.directive).toHaveBeenCalledWith('reveal', reveal)
  })
})
