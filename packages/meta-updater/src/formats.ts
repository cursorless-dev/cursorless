import { createFormat } from "@pnpm/meta-updater";
import { readFile, writeFile } from "fs/promises";
import { equals } from "ramda";
import yaml from "yaml";

export const formats = {
  /**
   * A format that today we just use for .pre-commit-config.yaml files.  This is a yaml file, but we
   * need to preserve comments, so we use the `yaml` library's document representation instead of
   * parsing it into a plain js object.
   */
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
