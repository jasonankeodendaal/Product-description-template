// Manually define ImportMetaEnv to bypass issues with vite/client type resolution.
interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // Add other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
