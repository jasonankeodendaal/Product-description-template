// FIX: Removed the triple-slash directive to `vite/client` as it was causing a "Cannot find type definition file" error.
// The interfaces below provide the necessary types for `import.meta.env` within the project scope.

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // Add other environment variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
