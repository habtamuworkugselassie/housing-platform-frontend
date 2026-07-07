/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Shown on legal pages (mailto) and for store “support” contact alignment */
  readonly VITE_SUPPORT_EMAIL?: string
  /** Set to 'false' to hide the public support chat widget */
  readonly VITE_SUPPORT_CHAT_ENABLED?: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
