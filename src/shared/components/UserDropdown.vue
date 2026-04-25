<template>
  <div
    class="relative inline-block text-left"
    @mouseenter="dropdownOpen = true"
    @mouseleave="dropdownOpen = false"
  >
    <button
      type="button"
      class="flex items-center gap-2 focus:outline-none"
      :aria-expanded="dropdownOpen"
      aria-haspopup="true"
      @click="dropdownOpen = !dropdownOpen"
      @blur="onBlur"
    >
      <div v-if="showName" class="text-right hidden md:block">
        <div class="text-sm font-medium" :class="nameClass">{{ authStore.user?.firstName || $t('common.user') }}</div>
        <div class="text-xs" :class="subtitleClass">{{ authStore.user?.phoneNumber || authStore.user?.email || '' }}</div>
      </div>
      <div 
        class="rounded-full flex items-center justify-center font-semibold shrink-0"
        :class="avatarClass"
      >
        <img v-if="authStore.user?.profileImageUrl" :src="mediaUrl(authStore.user.profileImageUrl)" alt="Profile" class="w-full h-full rounded-full object-cover border border-white/20" />
        <template v-else>{{ userInitials }}</template>
      </div>
    </button>
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        v-show="dropdownOpen"
        class="absolute right-0 top-full pt-2 min-w-[200px] z-50 origin-top-right"
      >
        <div class="rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-md shadow-xl shadow-black/30 py-1.5 overflow-hidden">
          <div class="px-4 py-3 border-b border-white/10 w-full text-left" v-if="mobileMode">
             <div class="text-sm font-medium text-white">{{ authStore.user?.firstName || 'User' }} {{ authStore.user?.lastName || '' }}</div>
             <div class="text-xs text-gray-400 truncate">{{ authStore.user?.email || '' }}</div>
          </div>
          <router-link
            to="/profile"
            class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-black hover:bg-violet-950/20 transition-colors duration-150 border-l-2 border-transparent hover:border-black"
            @click="dropdownOpen = false"
          >
            <span class="material-icons text-[20px]" aria-hidden="true">person</span>
            {{ $t('common.profile') }}
          </router-link>
          
          <button
            @click="handleLogout"
            class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 border-l-2 border-transparent hover:border-red-400"
          >
            <span class="material-icons text-[20px]" aria-hidden="true">logout</span>
            {{ $t('nav.logout') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import { mediaUrl } from '@/shared/api/client'

const props = defineProps({
  showName: {
    type: Boolean,
    default: true
  },
  nameClass: {
    type: String,
    default: 'text-white'
  },
  subtitleClass: {
    type: String,
    default: 'text-gray-400'
  },
  avatarClass: {
    type: String,
    default: 'w-8 h-8 sm:w-10 sm:h-10 bg-white text-black text-sm sm:text-base'
  },
  mobileMode: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()
const router = useRouter()
const dropdownOpen = ref(false)

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return 'U'
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
})

const onBlur = () => {
  setTimeout(() => { dropdownOpen.value = false }, 150)
}

const handleLogout = async () => {
  dropdownOpen.value = false
  await authStore.logout()
  router.push('/login')
}
</script>
