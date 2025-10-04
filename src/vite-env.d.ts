// FIX: The `/// <reference types="vite/client" />` directive was removed.
// It was causing a "Cannot find type definition file for 'vite/client'" error.
// The manual type definitions below are a workaround to ensure `import.meta.env` is typed correctly.
interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // Add other environment variables used in the app here.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
