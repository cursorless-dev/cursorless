import path from "node:path";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";
import type { RecordedTestPath } from "@cursorless/lib-node-common";
import {
  getRecordedTestsDirPath,
  loadFixture,
} from "@cursorless/lib-node-common";

export const recordedTestVisualizerImport = `import { RecordedTestVisualizer, RecordedTestVisualizerOptions, RecordedTestVisualizerProvider } from "@site/src/docs/components/RecordedTestVisualizer";`;

interface RecordedTestData {
  path: string;
  name: string;
  fixture: TestCaseFixtureLegacy;
}

export function updateRecordedTestFixtureData(
  recordedTestPaths: RecordedTestPath[],
  _actual: unknown,
  options: FormatPluginFnOptions,
): Promise<RecordedTestData[] | null> {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return Promise.resolve(null);
  }
  if (recordedTestPaths.length === 0) {
    return Promise.resolve(null);
  }

  const recordedTestsDir = getRecordedTestsDirPath();
  return Promise.all(
    recordedTestPaths.map(async (test) => ({
      path: path
        .relative(recordedTestsDir, test.path)
        .replaceAll(path.sep, "/"),
      name: test.name,
      fixture: await loadFixture(test.path),
    })),
  );
}

export async function renderRecordedTestVisualizer(
  recordedDocsPaths: RecordedTestPath[],
): Promise<string | undefined> {
  if (recordedDocsPaths.length === 0) {
    return undefined;
  }

  const lines = [
    "## Visualization",
    "",
    "<RecordedTestVisualizerProvider recordedTests={recordedTests}>",
    "",
    "<RecordedTestVisualizerOptions />",
    "",
  ];

  for (const path of recordedDocsPaths) {
    const fixture = await loadFixture(path.path);

    if (fixture.command.spokenForm == null) {
      throw new Error(`Fixture ${path.name} has no spoken form`);
    }

    if (
      fixture.initialState.hatTokenMap == null ||
      fixture.finalState?.hatTokenMap == null
    ) {
      throw new Error(`Fixture ${path.name} is missing hatTokenMap`);
    }

    lines.push(
      `### \`"${fixture.command.spokenForm}"\``,
      "",
      `<RecordedTestVisualizer fixtureName="${path.name}" />`,
      "",
    );
  }

  lines.push("</RecordedTestVisualizerProvider>");

  return lines.join("\n");
}
