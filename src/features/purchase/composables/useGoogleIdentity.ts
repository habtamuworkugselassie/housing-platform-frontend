/**
 * Google Identity Services ("Sign in with Google") loader.
 *
 * Loads https://accounts.google.com/gsi/client once, renders the official button into a container
 * and hands the returned credential (a Google ID token) to the caller, who posts it to
 * /auth/google. Disabled entirely when VITE_GOOGLE_CLIENT_ID is unset so environments without a
 * Google project simply do not show the button.
 */
import { onBeforeUnmount, ref, type Ref } from 'vue'

declare global {
  interface Window {
    google?: any
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'
let loader: Promise<void> | null = null

export function googleClientId(): string {
  const id = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID
  return typeof id === 'string' ? id.trim() : ''
}

export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
      const script = existing ?? document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      script.defer = true
      script.addEventListener('load', () => resolve())
      script.addEventListener('error', () => {
        loader = null
        reject(new Error('Google Identity Services failed to load'))
      })
      if (!existing) document.head.appendChild(script)
    })
  }
  return loader
}

export interface UseGoogleIdentity {
  /** False when no client id is configured or the script could not load. */
  available: Ref<boolean>
  loading: Ref<boolean>
  error: Ref<string | null>
  /** Renders the button into `container` and resolves credentials through `onCredential`. */
  renderButton: (container: HTMLElement, onCredential: (idToken: string) => void, locale?: string) => Promise<void>
}

export function useGoogleIdentity(): UseGoogleIdentity {
  const clientId = googleClientId()
  const available = ref(Boolean(clientId))
  const loading = ref(false)
  const error = ref<string | null>(null)
  let cancelled = false

  async function renderButton(container: HTMLElement, onCredential: (idToken: string) => void, locale = 'en') {
    if (!clientId) {
      available.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      await loadGoogleIdentity()
      if (cancelled) return
      const gis = window.google?.accounts?.id
      if (!gis) throw new Error('Google Identity Services unavailable')
      gis.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response?.credential) onCredential(response.credential)
        },
        ux_mode: 'popup',
        auto_select: false,
        itp_support: true
      })
      container.innerHTML = ''
      gis.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: Math.min(400, Math.max(200, container.clientWidth || 320)),
        locale
      })
    } catch (e: any) {
      available.value = false
      error.value = e?.message || 'Google sign-in unavailable'
    } finally {
      loading.value = false
    }
  }

  onBeforeUnmount(() => {
    cancelled = true
  })

  return { available, loading, error, renderButton }
}
