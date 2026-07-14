<template>
  <section class="landing-hero" aria-label="Ethio Build Connect">
    <div class="landing-hero__pattern" aria-hidden="true" />
    <div class="landing-hero__glow landing-hero__glow--one" aria-hidden="true" />
    <div class="landing-hero__glow landing-hero__glow--two" aria-hidden="true" />

    <div class="landing-hero__content">
      <div class="landing-hero__copy">
        <p class="landing-hero__eyebrow">Ethio Build Connect</p>
        <h1>{{ $t('home.heroHeadline') }}</h1>
        <p class="landing-hero__lead">{{ $t('home.heroSubtext') }}</p>
        <div class="landing-hero__actions">
          <button type="button" class="landing-hero__primary" @click="scrollToListings">
            {{ $t('home.heroCta') }}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </button>
          <router-link to="/properties" class="landing-hero__secondary">
            {{ $t('nav.properties') }}
          </router-link>
        </div>
        <p class="landing-hero__trust">
          <span class="landing-hero__trust-dot" />
          {{ listingCount != null && companyCount != null
            ? `${listingCount} ${$t('home.trustListings')} · ${companyCount} ${$t('home.companies')}`
            : $t('home.heroTrustLine') }}
        </p>
      </div>

      <aside class="landing-hero__panel" aria-label="Platform highlights">
        <p class="landing-hero__panel-label">One connected marketplace</p>
        <div class="landing-hero__panel-item">
          <span>01</span>
          <div><strong>Verified listings</strong><small>Make confident property decisions.</small></div>
        </div>
        <div class="landing-hero__panel-item">
          <span>02</span>
          <div><strong>Trusted partners</strong><small>Meet leading companies in one place.</small></div>
        </div>
        <div class="landing-hero__panel-item">
          <span>03</span>
          <div><strong>Built for Ethiopia</strong><small>Real estate, construction, and finance.</small></div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
defineProps({
  listingCount: { type: Number, default: null },
  companyCount: { type: Number, default: null }
})

function scrollToListings() {
  document.getElementById('main-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.landing-hero { position: relative; isolation: isolate; overflow: hidden; border-top: 1px solid rgba(244, 201, 119, .38); background: #4c1d95; color: #fff; }
.landing-hero__content { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(17rem, .65fr); gap: 4rem; max-width: 80rem; margin: auto; padding: clamp(4rem, 8vw, 7.25rem) 1.5rem; }
.landing-hero__pattern { position: absolute; inset: 0; opacity: .22; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 3.5rem 3.5rem; mask-image: linear-gradient(90deg, #000, transparent 82%); }
.landing-hero::after { position: absolute; right: 0; bottom: 0; left: 0; height: .25rem; content: ''; background: linear-gradient(90deg, transparent, rgba(244, 201, 119, .85), transparent); opacity: .75; }
.landing-hero__glow { position: absolute; border-radius: 999px; filter: blur(20px); pointer-events: none; }
.landing-hero__glow--one { width: 34rem; height: 34rem; right: -10rem; top: -16rem; background: rgba(201, 154, 65, .28); }
.landing-hero__glow--two { width: 24rem; height: 24rem; left: 31%; bottom: -16rem; background: rgba(126, 34, 206, .42); }
.landing-hero__copy { max-width: 46rem; }
.landing-hero__eyebrow, .landing-hero__panel-label { margin: 0 0 1.35rem; color: #f4c977; font-size: .72rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
h1 { max-width: 46rem; margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2.7rem, 5.1vw, 5.25rem); font-weight: 500; letter-spacing: -.055em; line-height: .99; }
.landing-hero__lead { max-width: 39rem; margin: 1.7rem 0 0; color: #eadcff; font-size: clamp(1rem, 1.6vw, 1.18rem); line-height: 1.75; }
.landing-hero__actions { display: flex; flex-wrap: wrap; gap: .85rem; margin-top: 2.3rem; }
.landing-hero__primary, .landing-hero__secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 3.25rem; padding: 0 1.25rem; border-radius: .6rem; font-size: .86rem; font-weight: 750; text-decoration: none; transition: transform .2s ease, background-color .2s ease; }
.landing-hero__primary { gap: .7rem; border: 0; background: #f4c977; color: #3b0764; cursor: pointer; }
.landing-hero__primary:hover, .landing-hero__secondary:hover { transform: translateY(-2px); }
.landing-hero__primary svg { width: 1.1rem; fill: none; stroke: currentColor; stroke-width: 2; }
.landing-hero__secondary { border: 1px solid rgba(255,255,255,.26); color: #fff; }
.landing-hero__trust { display: flex; align-items: center; gap: .55rem; margin: 1.6rem 0 0; color: #ddd6fe; font-size: .83rem; }
.landing-hero__trust-dot { width: .5rem; height: .5rem; border-radius: 50%; background: #6ac3a1; box-shadow: 0 0 0 .24rem rgba(106,195,161,.12); }
.landing-hero__panel { align-self: end; padding: 1.5rem; border: 1px solid rgba(255,255,255,.2); border-radius: 1rem; background: rgba(46,16,101,.58); box-shadow: 0 1.25rem 4rem rgba(29,4,62,.25); backdrop-filter: blur(16px); }
.landing-hero__panel-label { margin-bottom: 1.1rem; color: #f0c36a; }
.landing-hero__panel-item { display: grid; grid-template-columns: 2rem 1fr; gap: .75rem; padding: 1rem 0; border-top: 1px solid rgba(255,255,255,.11); }
.landing-hero__panel-item span { color: #f0c36a; font-size: .74rem; font-weight: 800; }
.landing-hero__panel-item strong, .landing-hero__panel-item small { display: block; }
.landing-hero__panel-item strong { font-size: .95rem; }
.landing-hero__panel-item small { margin-top: .23rem; color: #ddd6fe; font-size: .78rem; line-height: 1.45; }
@media (max-width: 760px) { .landing-hero__content { grid-template-columns: 1fr; gap: 2.5rem; padding-top: 4rem; padding-bottom: 3.5rem; } .landing-hero__panel { max-width: 33rem; } }
</style>
