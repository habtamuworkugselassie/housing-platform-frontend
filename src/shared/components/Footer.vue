<template>
  <footer class="flex-shrink-0 border-t border-white/10 bg-zinc-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-white">{{ companyName }}</p>
          <p class="text-sm text-gray-400 mt-0.5">{{ address }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400">
          <a
            :href="`tel:${phoneRaw}`"
            class="hover:text-yellow-400 transition-colors"
          >
            {{ phone }}
          </a>
          <a
            :href="websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-yellow-400 transition-colors"
          >
            {{ website }}
          </a>
        </div>
        <div class="flex items-center gap-8 text-sm text-gray-500">
          <a href="#" class="hover:text-yellow-400 transition">{{ $t('exhibition.footer.privacy') }}</a>
          <a href="#" class="hover:text-yellow-400 transition">{{ $t('exhibition.footer.terms') }}</a>
          <a href="#" class="hover:text-white transition">{{ $t('exhibition.footer.contact') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const companyName = 'Dream Teams PLC'
const address = 'Addis Ababa, Ethiopia'
const phone = '+251 913 504 097'
const phoneRaw = '251913504097'
const website = 'www.dreamteam.com'
const websiteUrl = 'https://www.dreamteam.com'
</script>
