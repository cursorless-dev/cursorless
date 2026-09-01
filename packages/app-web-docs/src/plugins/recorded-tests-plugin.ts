import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LoadContext, Plugin, PluginOptions } from "@docusaurus/types";
import { loadFixture } from "@cursorless/lib-node-common";
import type { RecordedTest } from "../docs/components/types";

// oxlint-disable-next-line unicorn/prefer-import-meta-properties
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// oxlint-disable-next-line import/no-default-export
export default function recordedTestsPlugin(
  _context: LoadContext,
  _options: PluginOptions,
): Plugin<RecordedTest[]> {
  return {
    name: "recorded-tests-plugin",

    loadContent(): Promise<RecordedTest[]> {
      const recordedTestsDirectory = path.join(
        __dirname,
        "../../../../resources/fixtures/recorded/docs",
      );

      const recordedTestPaths = fs
        .globSync("**/*.{yml,yaml}", { cwd: recordedTestsDirectory })
        .toSorted();

      return Promise.all(
        recordedTestPaths.map(async (relativePath) => {
          const testPath = relativePath.replaceAll(path.sep, "/");
          return {
            path: testPath,
            name: testPath.slice(0, -path.extname(relativePath).length),
            fixture: await loadFixture(
              path.join(recordedTestsDirectory, relativePath),
            ),
          };
        }),
      );
    },

    contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
