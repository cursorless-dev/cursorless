/* eslint-disable @typescript-eslint/no-var-requires */
// Generated using webpack-cli https://github.com/webpack/webpack-cli
/*eslint-env node*/

import { join } from "path";
import { readFileSync } from "fs";

const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map((ref) => ref.path);

export const content = [".", ...references].map(
  (dir) => `${dir}/src/**/*!(*.stories|*.spec).{ts,tsx,html}`,
);
export const theme = {
  extend: {},
};
export const plugins = [];
