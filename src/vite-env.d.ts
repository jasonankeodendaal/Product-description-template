// FIX: Replaced triple-slash directive with a direct import to solve the type resolution issue.
import 'vite/client';

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // Add other environment variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
