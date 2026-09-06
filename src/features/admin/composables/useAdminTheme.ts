import { ref, readonly } from 'vue'

/**
 * Light/dark theme state for the admin portal.
 *
 * The portal is themed independently of the (always-dark) public site: the
 * active value is written as `data-theme` on the `.admin-shell` root, where the
 * CSS variables in admin-theme.css pick it up. Light is the default so the
 * portal matches the rest of the app; the toggle still switches to dark and a
 * stored choice wins over the default. The choice is a module singleton and
 * persisted to localStorage, so it survives route changes and reloads.
 */

export type AdminTheme = 'dark' | 'light'

const STORAGE_KEY = 'admin-theme'

function readStored(): AdminTheme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    // localStorage may be unavailable (private mode, blocked storage) — fall back.
  }
  // Light by default, matching the rest of the app. The toggle still works and
  // a stored choice still wins, so anyone who prefers the dark portal keeps it.
  return 'light'
}

const theme = ref<AdminTheme>(readStored())

function persist(value: AdminTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Non-fatal: theme still applies for this session.
  }
}

function setTheme(value: AdminTheme) {
  theme.value = value
  persist(value)
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useAdminTheme() {
  return {
    theme: readonly(theme),
    isDark: () => theme.value === 'dark',
    setTheme,
    toggleTheme,
  }
}
