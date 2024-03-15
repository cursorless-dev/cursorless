import { readFileSync } from "fs";

const references = JSON.parse(
  readFileSync("tsconfig.json", "utf-8"),
).references.map((ref) => ref.path);

export const content = [".", ...references].map(
  (dir) => `${dir}/src/**/*!(*.stories|*.spec).{ts,tsx,html}`,
);
export const theme = {
  extend: {},
};
export const plugins = [];
