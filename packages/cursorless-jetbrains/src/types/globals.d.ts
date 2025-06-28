// Global type declarations for cursorless-jetbrains

declare global {
  interface EmscriptenModule {
    locateFile?: (path: string, prefix: string) => string;
  }
}

export {};