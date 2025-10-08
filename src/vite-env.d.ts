// FIX: The triple-slash directive can conflict with type inclusion from tsconfig.json,
// causing "Cannot find type definition" errors. Assuming 'vite/client' is correctly
// included in the project's tsconfig.json, this directive is unnecessary and can be removed.

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
