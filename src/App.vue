<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup>
import { NavBar } from '@/shared/components'
</script>
