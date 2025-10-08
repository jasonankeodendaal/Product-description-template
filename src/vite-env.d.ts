// FIX: Changed from triple-slash directive to import statement to ensure Vite client types are loaded correctly.
import 'vite/client';

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
