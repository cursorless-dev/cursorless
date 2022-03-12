module.exports = {
    tsconfig: "../tsconfig.json",
    entryPoints: ["../src/"],
    entryPointStrategy: "expand",
    readme: "../docs/contributing/core-code-pointers.md",

    // Out path is relative to docsRoot
    out: "contributing/api",

    // typedoc-plugin-missing-exports option
    internalNamespace: "internal",

    plugin: [
      "typedoc-plugin-rename-defaults",
      "typedoc-plugin-mdn-links",
      "typedoc-plugin-missing-exports",
    ],
};