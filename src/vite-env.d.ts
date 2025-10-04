// FIX: Manually define the types for import.meta.env to resolve issues with vite/client types not being found
// and to fix the resulting type error in src/constants.ts.
interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
