import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry } from "@cursorless/lib-common";
import { capitalize } from "@cursorless/lib-common";
import {
  renderScopeVisualizer,
  scopeVisualizerImport,
} from "./renderScopeVisualizerMdx";
import type { ScopeFixtureGroup } from "./scopeFixtureGroups";
import { DISABLED_BY_DEFAULT } from "./util/constants";
import { formatVariables } from "./util/formatVariables";
import { injectSpokenForm } from "./util/injectSpokenForm";

export function updateReferenceMdx(
  id: string,
  entry: ReferenceEntry<string>,
  scopeFixtureGroups: ScopeFixtureGroup[] | undefined,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return null;
  }

  if (entry.examples.length < entry.syntaxes.length) {
    throw new Error(
      `Reference "${id}" has ${entry.syntaxes.length} syntaxes, but only ${entry.examples.length} examples`,
    );
  }

  const scopeVisualizer = renderScopeVisualizer(scopeFixtureGroups ?? []);
  const expected: string[] = [];
  let title = entry.name;

  if (entry.defaultSpokenForm != null) {
    const spokenForm = capitalize(entry.defaultSpokenForm);
    expected.push(`---`, `sidebar_label: ${spokenForm}`, `---`, "");
    if (spokenForm !== entry.name) {
      title = `${spokenForm} (${entry.name})`;
    }
  }

  if (scopeVisualizer != null) {
    expected.push(scopeVisualizerImport, "");
  }

  expected.push(`# ${title}`, "");

  if (entry.description != null) {
    expected.push(entry.description, "");
  }

  expected.push(`Cursorless ID: ${code(id)}`, "");

  const spokenFormLines: string[] = [];

  if (entry.defaultSpokenForm != null) {
    spokenFormLines.push(`Default: ${code(entry.defaultSpokenForm)}`);
  }

  if (entry.legacySpokenForms != null) {
    spokenFormLines.push(
      `Legacy: ${entry.legacySpokenForms.map((s) => code(s)).join(", ")}`,
    );
  }

  if (entry.disabledByDefault) {
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
