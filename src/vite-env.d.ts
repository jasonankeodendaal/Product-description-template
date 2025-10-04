/// <reference types="vite/client" />

// FIX: Manually define the 'import.meta.env' types as a workaround for
// the "Cannot find type definition file for 'vite/client'" error.
// This ensures that TypeScript recognizes Vite's environment variables.
interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // Add other environment variables used in the app here.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
