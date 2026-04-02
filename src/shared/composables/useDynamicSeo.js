import { useSeoMeta, useHead } from '@unhead/vue'
import { computed } from 'vue'
import { getPublicSiteUrl, resolveAbsoluteMediaUrl, truncateMetaDescription } from '@/utils/seo'

export function useDynamicSeo(options) {
  useSeoMeta({
    title: computed(() => options.value.title || 'Ethio Build Connect - Addis Ababa Real Estate'),
    description: computed(() => truncateMetaDescription(options.value.description)),
    ogTitle: computed(() => options.value.title || 'Ethio Build Connect - Addis Ababa Real Estate'),
    ogDescription: computed(() => truncateMetaDescription(options.value.description)),
    ogImage: computed(() => resolveAbsoluteMediaUrl(options.value.imageUrl) || `${getPublicSiteUrl()}/ethio-build-connect-mark.png`),
    ogUrl: computed(() => options.value.pagePath ? `${getPublicSiteUrl()}${options.value.pagePath}` : getPublicSiteUrl()),
    twitterCard: 'summary_large_image',
    twitterTitle: computed(() => options.value.title || 'Ethio Build Connect - Addis Ababa Real Estate'),
    twitterDescription: computed(() => truncateMetaDescription(options.value.description)),
    twitterImage: computed(() => resolveAbsoluteMediaUrl(options.value.imageUrl) || `${getPublicSiteUrl()}/ethio-build-connect-mark.png`),
  })

  // Canonical Link
  useHead({
    link: [
      {
        rel: 'canonical',
        href: computed(() => options.value.pagePath ? `${getPublicSiteUrl()}${options.value.pagePath}` : getPublicSiteUrl())
      }
    ]
  })
}
