/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli
/*eslint-env node*/

const { join } = require("path");
const { readFileSync } = require("fs");

const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map((ref) => ref.path);

module.exports = {
  content: [".", ...references].map(
    (dir) => `${dir}/src/**/*!(*.stories|*.spec).{ts,tsx,html}`,
  ),
  theme: {
    extend: {},
  },
  plugins: [],
};
