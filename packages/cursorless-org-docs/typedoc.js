const { readFileSync } = require("fs");
const path = require("path");

const packages = JSON.parse(
  readFileSync(path.join("..", "..", "tsconfig.json")),
).references.map(({ path }) => `../../${path}`);

/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  tsconfig: "../../tsconfig.json",
  entryPoints: packages,
  entryPointStrategy: "expand",

  readme: "../../docs/contributing/_api-index.md",

  exclude: ["**/node_modules/**", "**/out/**"],

  // typedoc-plugin-missing-exports option
  internalNamespace: "internal",

  plugin: [
    "typedoc-plugin-rename-defaults",
    "typedoc-plugin-mdn-links",
    "typedoc-plugin-missing-exports",
    "typedoc-plugin-resolve-crossmodule-references",
  ],
};
