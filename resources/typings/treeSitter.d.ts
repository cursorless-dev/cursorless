// Necessary because of faulty type in web-tree-sitter
type EmscriptenModule = unknown;

// web-tree-sitter references WebAssembly.Module, but Node typings do not
// provide it. Match the opaque interface in lib.dom so this also merges
// with the browser declaration without exposing browser globals to Node.
declare namespace WebAssembly {
  interface Module {}
}
