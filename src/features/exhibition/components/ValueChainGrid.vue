<template>
  <section class="py-24 lg:py-32 bg-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-16">
        <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-4">
          Construction value chain
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl">
          We cover the entire spectrum of the industry. Find the niche that matters to your business.
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="(sector, index) in sectors"
          :key="index"
          class="group relative h-40 overflow-hidden rounded-sm border border-gray-800 hover:border-amber-500/50 transition-all duration-300"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0 group-hover:from-gray-800 group-hover:to-gray-800/95 transition-all duration-300"></div>
          <div class="relative z-10 p-5 h-full flex flex-col justify-end">
            <h3 class="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
              {{ sector }}
            </h3>
            <div class="w-0 group-hover:w-10 h-0.5 bg-amber-500 mt-2 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const sectors = [
  'Building Materials',
  'Concrete & Cement',
  'Interiors & Finishes',
  'Urban Design',
  'Building Services (MEP)',
  'Construction Tools',
  'HVAC & Cooling',
  'Digital Construction',
  'Solar Energy',
  'Heavy Machinery',
  'Intelligent Building',
  'Sustainable Construction'
]
</script>
