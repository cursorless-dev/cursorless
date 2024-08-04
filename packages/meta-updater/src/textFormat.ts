import { createFormat } from "@pnpm/meta-updater";
import * as fs from "node:fs/promises";

export const textFormat = createFormat({
  read: ({ resolvedPath }) => fs.readFile(resolvedPath, "utf8"),
  update: (actual, updater, options) => updater(actual, options),
  equal: (expected, actual) => expected === actual,
  write: (expected, { resolvedPath }) =>
    fs.writeFile(resolvedPath, expected, "utf8"),
});
