import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { PairedDelimiterReference } from "@cursorless/lib-common";
import { DISABLED_BY_DEFAULT } from "./util/constants";
import { isAppWebDocs } from "./util/isManifest";

const HEADERS = [
  "Default spoken form",
  "Delimiter name",
  "Symbol inserted before target",
  "Symbol inserted after target",
  "Is wrapper?",
  "Is selectable?",
] as const;

export function updatePairedDelimitersMd(
  entries: Record<string, PairedDelimiterReference>,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const rows = Object.values(entries)
    .filter(
      (entry): entry is PairedDelimiterReference & { index: number } =>
        entry.visibility !== "private" && entry.index != null,
    )
    .toSorted((a, b) => a.index - b.index)
    .map((entry) => {
      const [before, after] = entry.delimiters ?? [null, null];
      const spokenForm = `${code(`"${entry.defaultSpokenForm}"`)}${entry.visibility === "disabledByDefault" ? ` (${DISABLED_BY_DEFAULT})` : ""}`;

      return [
        spokenForm,
        entry.name,
        before == null ? "N/A" : code(formatDelimiter(before)),
        after == null ? "N/A" : code(formatDelimiter(after)),
        booleanIcon(entry.delimiters != null),
        booleanIcon(entry.matchingDelimiters != null),
      ];
    });

  return [
    "---",
    "sidebar_group: Reference",
    "sidebar_position: 6",
    "---",
    "",
    "# Paired delimiters",
    "",
    ...formatTable(HEADERS, rows),
    "",
  ].join("\n");
}

function code(value: string): string {
  if (value.includes("`")) {
    return `\`\` ${value} \`\``;
  }

  return `\`${value}\``;
}

function formatDelimiter(value: string): string {
  return value.replaceAll("\\", String.raw`\\`);
}

function booleanIcon(value: boolean): string {
  return value ? "✅" : "❌";
}

function formatTable(
  headers: readonly string[],
  rows: readonly string[][],
): string[] {
  const columnWidths = headers.map((header, index) =>
    Math.max(
      displayWidth(header),
      ...rows.map((row) => displayWidth(row[index])),
    ),
  );
  const formatRow = (row: readonly string[]) =>
    `| ${row
      .map(
        (cell, index) =>
          `${cell}${" ".repeat(columnWidths[index] - displayWidth(cell))}`,
      )
      .join(" | ")} |`;

  return [
    formatRow(headers),
    formatRow(columnWidths.map((width) => "-".repeat(width))),
    ...rows.map(formatRow),
  ];
}

function displayWidth(value: string): number {
  return [...value].reduce(
    (width, character) =>
      width + (character === "✅" || character === "❌" ? 2 : 1),
    0,
  );
}
