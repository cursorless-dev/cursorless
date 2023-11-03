export const extensionDependencies = [
  // Cursorless access to Tree sitter
  "pokey.parse-tree",

  // Register necessary language-IDs for tests
  "scala-lang.scala", // scala
  "mrob95.vscode-talonscript", // talon
  "jrieken.vscode-tree-sitter-query", // scm
  "bbenoist.nix", // nix

  // Necessary for the `drink cell` and `pour cell` tests
  "ms-toolsai.jupyter",
];
