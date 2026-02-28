<template>
  <div class="exhibition-landing overflow-x-hidden bg-black text-white">
    <HeroSection />

    <!-- Why Exhibit -->
    <section id="why-exhibit" class="py-20 lg:py-28 bg-white text-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6">
              Inspire industry leaders at the exhibition
            </h2>
            <p class="text-lg text-gray-600 leading-relaxed mb-6">
              Showcase your vision alongside global influencers and decision-makers. Connect with institutional investors, developers, and government bodies driving the future of construction and real estate.
            </p>
            <ul class="space-y-3 text-gray-700 mb-8">
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                Unmatched access to high-value projects and partnerships
              </li>
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                Elevate your presence through sponsorship opportunities
              </li>
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                Conferences, networking sessions, and investor programs
              </li>
            </ul>
            <a href="#register" class="inline-flex px-8 py-4 bg-black text-white font-semibold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Book a stand
            </a>
          </div>
          <div class="aspect-[4/3] bg-gray-200 rounded overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">Exhibitor imagery</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Visit -->
    <section id="why-visit" class="py-20 lg:py-28 bg-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div class="order-2 lg:order-1 aspect-[4/3] bg-gray-900 rounded overflow-hidden">
            <div class="w-full h-full flex items-center justify-center text-gray-600 text-sm">Visitor experience</div>
          </div>
          <div class="order-1 lg:order-2">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6">
              Explore the future of living at the region’s largest real estate event
            </h2>
            <p class="text-lg text-gray-400 leading-relaxed mb-6">
              Immerse yourself in groundbreaking urban innovations and connect with global real estate leaders.
            </p>
            <ul class="space-y-3 text-gray-300 mb-8">
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                300+ exhibitors · 500+ speakers · 6 stages
              </li>
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                180+ hours of conference content
              </li>
              <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                Interactive show features and networking
              </li>
            </ul>
            <a href="#register" class="inline-flex px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors">
              Register to visit
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- What Happened (Cityscape-style 3 cards) -->
    <section class="py-20 lg:py-28 bg-zinc-950 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white/90 mb-12">
          What happened at the exhibition
        </h2>
        <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">The region’s biggest projects</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Latest launches, visionary masterplans, and breakthrough developments — all under one roof. 550+ exhibitors showcasing the future of real estate and construction.
            </p>
          </div>
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">Network with decision-makers</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Connect with investors, developers, and city leaders through curated networking. Unlock new capital, forge partnerships, and expand in the markets that matter.
            </p>
          </div>
          <div class="bg-white/5 border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
            <h3 class="text-lg font-bold uppercase tracking-tight text-white mb-3">Insights that matter</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Actionable insights from global visionaries — ministers, CEOs, and award-winning architects — on the trends reshaping how we live, invest, and build.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Show Features -->
    <section id="show-features" class="py-20 lg:py-28 bg-white text-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4">Key show features</h2>
        <p class="text-gray-600 max-w-2xl mb-10">
          World-class conferences, major announcements, developer programme, and specialised tracks.
        </p>
        <PillarGrid compact />
        <div class="mt-10 text-center">
          <a href="#features" class="inline-flex px-8 py-4 border-2 border-black font-semibold text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
            Explore more
          </a>
        </div>
      </div>
    </section>

    <!-- Who Attends (Cityscape-style audience cards) -->
    <section id="who-attends" class="py-20 lg:py-28 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4">Who attends</h2>
        <p class="text-gray-400 max-w-2xl mb-12">
          The event brings together real estate leaders — investors, developers, architects, government officials, and home buyers.
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <a
            v-for="audience in whoAttends"
            :key="audience.title"
            href="#"
            class="block p-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors group"
          >
            <h3 class="text-sm font-bold uppercase tracking-tight text-white group-hover:text-white mb-1">{{ audience.title }}</h3>
            <p class="text-xs text-gray-500">{{ audience.desc }}</p>
          </a>
        </div>
      </div>
    </section>

    <!-- Value chain / Sectors -->
    <ValueChainGrid />

    <!-- Testimonial strip (Cityscape-style) -->
    <section class="py-20 bg-zinc-950 border-t border-white/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white/90 mb-8">
          World-class leaders building the future
        </h2>
        <blockquote class="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
          “The exhibition is a perfect destination for international investors to meet and exchange ideas and explore how they can develop their own product and the wider market.”
        </blockquote>
        <p class="text-sm text-gray-500 uppercase tracking-wider">Industry Leader</p>
      </div>
    </section>

    <!-- Plan your visit -->
    <section class="py-20 lg:py-28 bg-white text-black">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-4">Plan your trip</h2>
        <p class="text-lg text-gray-600 mb-10">
          Join us for an event that pushes the boundaries of what’s possible in real estate and urban development.
        </p>
        <a href="#register" class="inline-flex px-8 py-4 bg-black text-white font-semibold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
          Plan your visit
        </a>
      </div>
    </section>

    <!-- Foundation Partners -->
    <section id="partners" class="py-16 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-white/50 text-xs font-semibold uppercase tracking-[0.25em] mb-8">Foundation Partners</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          <div v-for="i in 6" :key="i" class="h-10 w-28 bg-white/10 flex items-center justify-center text-white/40 text-xs">
            Partner {{ i }}
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-zinc-900 border-t border-white/10">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4">Ready to join the leaders?</h2>
        <p class="text-gray-400 mb-10">
          Book your stand or register to visit the most anticipated real estate and construction event of the year.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#register" class="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors min-w-[200px]">
            Stand enquiry
          </a>
          <a href="#brochure" class="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors min-w-[200px]">
            View event brochure
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 bg-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-500 text-sm">&copy; 2026 Construction Exhibition. All rights reserved.</p>
        <div class="flex items-center gap-8 text-sm text-gray-500">
          <a href="#" class="hover:text-white transition">Privacy</a>
          <a href="#" class="hover:text-white transition">Terms</a>
          <a href="#" class="hover:text-white transition">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import PillarGrid from '../components/PillarGrid.vue'
import ValueChainGrid from '../components/ValueChainGrid.vue'

const route = useRoute()

function scrollToHash() {
  const hash = route.hash || (typeof window !== 'undefined' ? window.location.hash : '')
  if (!hash) return
  const id = hash.replace(/^#/, '')
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  })
}

onMounted(scrollToHash)
watch(() => route.hash, scrollToHash)

const whoAttends = [
  { title: 'Real Estate Developers', desc: 'Master planners and project leads' },
  { title: 'Proptech Innovators', desc: 'Tech and property market solutions' },
  { title: 'Architects & Designers', desc: 'Sustainable and futuristic design' },
  { title: 'Government Officials', desc: 'National development strategies' },
  { title: 'Construction Professionals', desc: 'Contractors and infrastructure' },
  { title: 'Brokers & Consultants', desc: 'Market intelligence and advisory' },
  { title: 'Investors & Financiers', desc: 'High-value real estate opportunities' },
  { title: 'Homebuyers', desc: 'Residential trends and smart living' }
]
</script>

<style scoped>
.exhibition-landing {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
