import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

const HEADERS = ["Character", "Default spoken form"] as const;

export function updateGraphemeDefaultSpokenFormsMd(
  entries: Readonly<Record<string, string>>,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (options.manifest.name !== "@cursorless/app-web-docs") {
    return null;
  }

  const alphabet: string[][] = [];
  const digits: string[][] = [];
  const symbols: string[][] = [];

  for (const [character, spokenForm] of Object.entries(entries)) {
    const row = [code(character), code(spokenForm)];

    if (/^[a-z]$/u.test(character)) {
      alphabet.push(row);
    } else if (/^[0-9]$/u.test(character)) {
      digits.push(row);
    } else {
      symbols.push(row);
    }
  }

  return [
    "---",
    "sidebar_group: Reference",
    "sidebar_position: 7",
    "---",
    "",
    "# Alphabet and symbols",
    "",
    "Cursorless uses the [Talon Community](https://github.com/talonhub/community) alphabet, digits, and symbol spoken forms via the [`user.any_alphanumeric_key`](https://github.com/talonhub/community/blob/607c3415f5f29a5f75db6fe5648e37f514f62ac5/core/keys/keys.py#L71-L74) capture.",
    "",
    "## Alphabet",
    "",
    ...formatTable(HEADERS, alphabet),
    "",
    "## Symbols",
    "",
    ...formatTable(HEADERS, symbols),
    "",
    "## Digits",
    "",
    ...formatTable(HEADERS, digits),
    "",
  ].join("\n");
}

function code(value: string): string {
  const escaped = value.replaceAll("|", String.raw`\|`);

  if (escaped.includes("`")) {
    return `\`\` ${escaped} \`\``;
  }

  return `\`${escaped}\``;
}

function formatTable(
  headers: readonly string[],
  rows: readonly string[][],
): string[] {
  const columnWidths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );
  const formatRow = (row: readonly string[]) =>
    `| ${row
      .map(
        (cell, index) =>
          `${cell}${" ".repeat(columnWidths[index] - cell.length)}`,
      )
      .join(" | ")} |`;

  return [
    formatRow(headers),
    formatRow(columnWidths.map((width) => "-".repeat(width))),
    ...rows.map(formatRow),
  ];
}
