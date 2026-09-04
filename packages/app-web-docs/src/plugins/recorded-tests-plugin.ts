import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LoadContext, Plugin, PluginOptions } from "@docusaurus/types";
import {
  getRecordedDocsPaths,
  getRecordedTestsDirPath,
  getRecordedTutorialPaths,
  loadFixture,
} from "@cursorless/lib-node-common";
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
      const repoRoot = path.join(__dirname, "../../../..");
      // oxlint-disable-next-line node/no-process-env
      process.env.CURSORLESS_REPO_ROOT = repoRoot;

      const recordedTestsDir = getRecordedTestsDirPath();
      const recordedTestPaths = [
        ...getRecordedDocsPaths(),
        ...getRecordedTutorialPaths(),
      ];

      return Promise.all(
        recordedTestPaths.map(async (test) => {
          return {
            path: path
              .relative(recordedTestsDir, test.path)
              .replaceAll(path.sep, "/"),
            name: test.name,
            fixture: await loadFixture(test.path),
          };
        }),
      );
    },

    contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
