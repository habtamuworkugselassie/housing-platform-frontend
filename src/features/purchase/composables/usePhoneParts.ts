import { ref, watch, type Ref } from 'vue'
import { joinPhone, splitPhone } from '../utils/phone'

/**
 * Two-way bridge between one stored phone string (what the store, drafts and API use) and the
 * country-code selector plus national-number box the buyer sees.
 *
 * - Typing in either control rewrites the source as `joinPhone(countryCode, national)`.
 * - A change to the source from elsewhere (profile pre-fill, the account step, a restored draft)
 *   re-splits into the two controls.
 * - Pasting a full "+…" number into the national box re-selects its country.
 */
export function usePhoneParts(source: Ref<string>) {
  const initial = splitPhone(source.value)
  const countryCode = ref(initial.countryCode)
  const national = ref(initial.national)
  let lastPushed = source.value

  function push() {
    const joined = joinPhone(countryCode.value, national.value)
    lastPushed = joined
    if (source.value !== joined) source.value = joined
  }

  watch(countryCode, push)

  watch(national, (value) => {
    if (value.trim().startsWith('+')) {
      const parts = splitPhone(value)
      // Only re-split when the dial code was recognised; an unknown code stays as typed.
      if (!parts.national.startsWith('+') && (parts.countryCode !== countryCode.value || parts.national !== value)) {
        countryCode.value = parts.countryCode
        national.value = parts.national
        return // the two watchers fire again with the final values
      }
    }
    push()
  })

  watch(source, (value) => {
    if (value === lastPushed) return
    const parts = splitPhone(value)
    countryCode.value = parts.countryCode
    national.value = parts.national
    lastPushed = value
  })

  return { countryCode, national }
}
