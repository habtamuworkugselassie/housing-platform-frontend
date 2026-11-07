/**
 * v-reveal — fade-and-rise an element into view the first time it scrolls on screen.
 *
 *   <section v-reveal>…</section>              rises as one block
 *   <div v-reveal data-stagger>…children…</div> children rise one after another
 *   <div v-reveal="{ delay: 120 }">…</div>      extra delay in ms
 *
 * The directive adds `.reveal` and, once the element's top edge is a little way into the
 * viewport, `.is-in` (a tall panel must not wait until a large share of it is on screen). The
 * hidden state is applied by styles/motion.css only when <html> carries `has-reveal`,
 * which this module sets as soon as it runs: markup that reaches a browser without
 * JavaScript (prerendered HTML, a failed chunk) is simply visible, never stuck at
 * opacity 0. Browsers without IntersectionObserver get everything shown at once, and
 * `prefers-reduced-motion` turns the whole thing into a plain appear in CSS.
 */
const seen = new WeakSet()
let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        observer.unobserve(e.target)
      }
    },
    { threshold: 0.01, rootMargin: '0px 0px -6% 0px' }
  )
  return observer
}

export const reveal = {
  mounted(el, binding) {
    if (seen.has(el)) return
    seen.add(el)
    el.classList.add('reveal')
    const delay = binding.value?.delay
    if (typeof delay === 'number') el.style.setProperty('--reveal-delay', `${delay}ms`)
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

export function installReveal(app) {
  if (typeof document !== 'undefined') document.documentElement.classList.add('has-reveal')
  app.directive('reveal', reveal)
}
