import { loadFixture } from "@cursorless/lib-node-common";
import type { RecordedTestPath } from "@cursorless/lib-node-common";

export const recordedTestVisualizerImport = `import { RecordedTestVisualizer, RecordedTestVisualizerOptions, RecordedTestVisualizerProvider } from "@site/src/docs/components/RecordedTestVisualizer";`;

export async function renderRecordedTestVisualizer(
  recordedDocsPaths: RecordedTestPath[],
): Promise<string | undefined> {
  if (recordedDocsPaths.length === 0) {
    return undefined;
  }

  const lines = [
    "## Visualization",
    "",
    "<RecordedTestVisualizerProvider>",
    "",
    "<RecordedTestVisualizerOptions />",
    "",
  ];

  for (const path of recordedDocsPaths) {
    const fixture = await loadFixture(path.path);

    if (fixture.command.spokenForm == null) {
      throw new Error(`Fixture ${path.name} has no spoken form`);
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
