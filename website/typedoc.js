module.exports = {
  tsconfig: "../tsconfig.json",
  entryPoints: ["../src/"],
  entryPointStrategy: "expand",

  readme: "../docs/contributing/_api-index.md",

  // typedoc-plugin-missing-exports option
  internalNamespace: "internal",

  plugin: [
    "typedoc-plugin-rename-defaults",
    "typedoc-plugin-mdn-links",
    "typedoc-plugin-missing-exports",
  ],
};
