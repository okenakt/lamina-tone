/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Buy Me a Coffee username; the footer button is hidden when unset. */
  readonly VITE_BMC_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
