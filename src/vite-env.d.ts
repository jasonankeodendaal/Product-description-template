// FIX: Reverted from `import` to a triple-slash directive. Using an import statement
// turns this file into a module, preventing the interfaces from augmenting the global scope correctly.
// The triple-slash directive ensures these types are applied globally.
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
