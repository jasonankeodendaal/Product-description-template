interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
