import { createFormat } from "@pnpm/meta-updater";
import { readFile, writeFile } from "fs/promises";
import { equals } from "ramda";
import yaml from "yaml";

export const formats = {
  [".yaml"]: createFormat({
    async read({ resolvedPath }) {
      return yaml.parseDocument(await readFile(resolvedPath, "utf-8")).clone();
    },
    update(actual, updater, options) {
      return updater(actual, options);
    },
    equal(expected, actual) {
      return equals(actual.toJS(), expected.toJS());
    },
    async write(expected, { resolvedPath }) {
      await writeFile(resolvedPath, expected.toString());
    },
    clone(content) {
      return content == null ? content : content.clone();
    },
  }),
};
