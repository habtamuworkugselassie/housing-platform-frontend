import { watch, type MaybeRefOrGetter, toValue } from 'vue'
import { warmMediaCacheBatch } from '@/shared/utils/mediaPreload'

/**
 * When a list of media paths changes (e.g. organization or property loaded), prefetch each unique
 * URL once so repeated uses (hero + thumbnails + gallery) hit the browser HTTP cache.
 */
export function useMediaWarmup(urls: MaybeRefOrGetter<readonly (string | null | undefined)[]>) {
  watch(
    () => [...toValue(urls)],
    (list) => {
      warmMediaCacheBatch(list)
    },
    { immediate: true, deep: true }
  )
}
