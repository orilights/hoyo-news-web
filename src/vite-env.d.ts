/// <reference types="vite/client" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT_CN: string
  readonly VITE_API_ENDPOINT_OS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
