export const extensionDependencies = [
  // Cursorless access to Tree sitter
  "pokey.parse-tree",

  // Register necessary language-IDs for tests
  "jakebecker.elixir-ls", // elixir
  "jrieken.vscode-tree-sitter-query", // scm
  "mrob95.vscode-talonscript", // talon
  "scala-lang.scala", // scala

  // Necessary for the `drink cell` and `pour cell` tests
  "ms-toolsai.jupyter",
];
