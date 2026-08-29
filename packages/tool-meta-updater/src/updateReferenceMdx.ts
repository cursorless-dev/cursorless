import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { ReferenceEntry } from "@cursorless/lib-common";

const VAR_SPOKEN_FORM = "<spokenForm>";

export function updateReferenceMdx(
  kind: "action" | "modifier" | "scope",
  id: string,
  entry: ReferenceEntry,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs" || entry.private) {
    return null;
  }

  const isScope = kind === "scope";

  const expected: string[] = [];

  if (entry.nameShort != null) {
    expected.push(`---`, `sidebar_label: ${entry.nameShort}`, `---`, "");
  }

  if (isScope) {
    expected.push(
      `import { Scopes } from "@site/src/docs/components/Scopes";`,
      "",
    );
  }

  expected.push(`# ${entry.name}`, "");

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
    spokenFormLines.push(bold("Disabled by default"));
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
      const description = formatVariables(
        injectSpokenForm(syntax.description, entry.defaultSpokenForm),
      );
      expected.push(`- ${pattern}: ${description}`);
    }
    expected.push("");
  }

  //   if (entry.examples.length > 0) {
  //     expected.push(`## Examples`, "");
  //     for (const example of entry.examples) {
  //       const command = injectSpokenForm(
  //         example.command,
  //         entry.defaultSpokenForm,
  //       );
  //       expected.push(`- \`"${command}"\`: ${example.description}`);
  //     }
  //     expected.push("");
  //   }

  if (isScope) {
    expected.push(`<Scopes scopeTypeType="${id}" />`, "");
  }

  return expected.join("\n");
}

function code(value: string) {
  return `\`${value}\``;
}

function bold(value: string) {
  return `**${value}**`;
}

function injectSpokenForm(
  pattern: string,
  defaultSpokenForm: string | undefined,
): string {
  if (defaultSpokenForm == null) {
    if (pattern.includes(VAR_SPOKEN_FORM)) {
      throw new Error(
        `Pattern "${pattern}" contains ${VAR_SPOKEN_FORM}, but no defaultSpokenForm is provided`,
      );
    }
    return pattern;
  }
  return pattern.replace(VAR_SPOKEN_FORM, defaultSpokenForm);
}

function formatVariables(pattern: string): string {
  return pattern
    .split(/(<[\w ]+>)/gu)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) {
        return code(part);
      }
      return part;
    })
    .join("");
}

function formatGroup(lines: string[]): string[] {
  return lines.map((line, index) =>
    index < lines.length - 1 ? `${line}\\` : line,
  );
}
