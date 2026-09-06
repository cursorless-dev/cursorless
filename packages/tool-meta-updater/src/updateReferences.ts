import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry, ReferenceGroup } from "@cursorless/lib-common";
import { capitalize } from "@cursorless/lib-common";
import type { RecordedTestPath } from "@cursorless/lib-node-common";
import {
  recordedTestVisualizerImport,
  renderRecordedTestVisualizer,
} from "./renderRecordedTestVisualizer";
import {
  renderScopeVisualizer,
  scopeVisualizerImport,
} from "./renderScopeVisualizerMdx";
import type { ScopeFixtureGroup } from "./scopeFixtureGroups";
import { cleanId } from "./util/cleanId";
import { DISABLED_BY_DEFAULT } from "./util/constants";
import { formatVariables } from "./util/formatVariables";
import { injectSpokenForm } from "./util/injectSpokenForm";
import { isAppWebDocs } from "./util/isManifest";

export function updateReferenceReadmeMd(
  title: string,
  entries: Record<string, ReferenceEntry<string>>,
  groups: ReferenceGroup<string>[],
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const expected: string[] = [`# ${title}`, ""];

  for (const group of groups) {
    const groupEntries = Object.entries(entries)
      .filter(([, entry]) => entry.group.id === group.id)
      .toSorted(([, a], [, b]) => a.group.index - b.group.index);

    expected.push(`## ${group.name}`, "");

    if (group.description != null) {
      expected.push(group.description, "");
    }

    for (const [rawId, entry] of groupEntries) {
      const id = cleanId(rawId);
      const disabledByDefault =
        entry.visibility === "disabledByDefault"
          ? ` (${DISABLED_BY_DEFAULT})`
          : "";
      for (const syntax of entry.syntaxes) {
        const pattern = injectSpokenForm(
          syntax.pattern,
          entry.defaultSpokenForm,
        );
        const description = formatVariables(syntax.description);
        expected.push(
          `- [\`"${pattern}"\`](./${id}.mdx) - ${description}${disabledByDefault}`,
        );
      }
      if (entry.syntaxes.length === 0) {
        const name =
          entry.defaultSpokenForm != null
            ? `\`"${entry.defaultSpokenForm}"\``
            : entry.name;
        expected.push(`- [${name}](./${id}.mdx)`);
      }
    }

    expected.push("");
  }

  return expected.join("\n");
}

export async function updateReferenceMdx(
  id: string,
  entry: ReferenceEntry<string>,
  recordedDocsPaths: RecordedTestPath[],
  scopeFixtureGroups: ScopeFixtureGroup[],
  actual: string | null,
  options: FormatPluginFnOptions,
): Promise<string | null> {
  if (!isAppWebDocs(options)) {
    return null;
  }

  if (entry.examples.length < entry.syntaxes.length) {
    throw new Error(
      `Reference "${id}" has ${entry.syntaxes.length} syntaxes, but only ${entry.examples.length} examples`,
    );
  }

  const recordedTestVisualizer =
    await renderRecordedTestVisualizer(recordedDocsPaths);
  const scopeVisualizer = renderScopeVisualizer(scopeFixtureGroups);
  const expected: string[] = [];
  let title = entry.name;

  if (entry.defaultSpokenForm != null) {
    const spokenForm = capitalize(entry.defaultSpokenForm);
    expected.push(`---`, `sidebar_label: ${spokenForm}`, `---`, "");
    if (spokenForm !== entry.name) {
      title = `${spokenForm} (${entry.name})`;
    }
  }

  if (recordedTestVisualizer != null) {
    expected.push(
      recordedTestVisualizerImport,
      `import recordedTests from "./fixtures/${cleanId(id)}.json";`,
      "",
    );
  }
  if (scopeVisualizer != null) {
    expected.push(
      scopeVisualizerImport,
      `import scopeTests from "./fixtures/${cleanId(id)}.json";`,
      "",
    );
  }

  expected.push(`# ${title}`, "");

  if (entry.description != null) {
    expected.push(entry.description, "");
  }

  expected.push(`Cursorless ID: ${code(entry.csv_id ?? id)}`, "");

  const spokenFormLines: string[] = [];

  if (entry.defaultSpokenForm != null) {
    spokenFormLines.push(`Default: ${code(entry.defaultSpokenForm)}`);
  }

  if (entry.legacySpokenForms != null) {
    spokenFormLines.push(
      `Legacy: ${entry.legacySpokenForms.map((s) => code(s)).join(", ")}`,
    );
  }

  if (entry.visibility === "disabledByDefault") {
    spokenFormLines.push(DISABLED_BY_DEFAULT);
  }

  if (spokenFormLines.length > 0) {
    expected.push("## Spoken form", "", ...formatGroup(spokenFormLines), "");
  }

  if (entry.syntaxes.length > 0) {
    expected.push(`## Syntax`, "");
    for (const syntax of entry.syntaxes) {
      const pattern = formatVariables(
        injectSpokenForm(syntax.pattern, entry.defaultSpokenForm),
      );
      const description = formatVariables(syntax.description);
      expected.push(`- ${pattern} - ${description}`);
    }
    expected.push("");
  }

  if (entry.examples.length > 0) {
    expected.push(`## Examples`, "");
    for (const example of entry.examples) {
      const command = injectSpokenForm(
        example.command,
        entry.defaultSpokenForm,
      );
      expected.push(`- \`"${command}"\` - ${example.description}`);
    }
    expected.push("");
  }

  if (recordedTestVisualizer != null) {
    expected.push(recordedTestVisualizer, "");
  }

  if (scopeVisualizer != null) {
    expected.push(scopeVisualizer, "");
  }

  return expected.join("\n");
}

function code(value: string) {
  return `\`${value}\``;
}

function formatGroup(lines: string[]): string[] {
  return lines.map((line, index) =>
    index < lines.length - 1 ? `${line}\\` : line,
  );
}
