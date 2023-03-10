module.exports = {
  tsconfig: "../cursorless-vscode/tsconfig.json",
  entryPoints: ["../cursorless-vscode"],
  entryPointStrategy: "expand",

  readme: "../../docs/contributing/_api-index.md",

  exclude: ["**/node_modules/**", "**/out/**"],

  plugin: [
    "typedoc-plugin-rename-defaults",
    "typedoc-plugin-mdn-links",
    "typedoc-plugin-missing-exports",
    "typedoc-plugin-resolve-crossmodule-references",
  ],
};
