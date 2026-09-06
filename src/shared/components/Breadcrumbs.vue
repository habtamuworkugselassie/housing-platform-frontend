<template>
  <nav v-if="crumbs.length > 1" :aria-label="$t('breadcrumbs.label')" class="mb-4">
    <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-500">
      <li v-for="(crumb, i) in crumbs" :key="crumb.name + i" class="flex items-center gap-x-1.5">
        <span v-if="i > 0" class="select-none text-gray-400" aria-hidden="true">/</span>
        <router-link
          v-if="crumb.path && i < crumbs.length - 1"
          :to="crumb.path"
          class="rounded px-1 py-1.5 hover:text-primary-600 hover:underline"
        >
          {{ crumb.name }}
        </router-link>
        <!-- The last crumb is the page you are already on, so it is text, not a link. -->
        <span v-else class="max-w-[16rem] truncate px-1 py-1.5 text-gray-700" aria-current="page">
          {{ crumb.name }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
/**
 * The visible half of a breadcrumb trail. It takes the same `[{ name, path }]`
 * array that `setBreadcrumbJsonLd` emits as BreadcrumbList, so the markup a person
 * sees and the schema a crawler reads can never drift apart — Google expects them
 * to agree.
 */
defineProps({
  crumbs: {
    type: Array,
    default: () => []
  }
})
</script>
