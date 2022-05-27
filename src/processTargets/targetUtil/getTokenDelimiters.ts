import { Range, TextEditor } from "vscode";

export function getTokenDelimiters(editor: TextEditor, contentRange: Range) {
  const { document } = editor;
  const { start, end } = contentRange;
  const endLine = document.lineAt(end);

  const startLine = document.lineAt(start);
  const leadingText = startLine.text.slice(0, start.character);
  const leadingDelimiters = leadingText.match(/\s+$/);
  const leadingDelimiterRange =
    leadingDelimiters != null
      ? new Range(
          start.line,
          start.character - leadingDelimiters[0].length,
          start.line,
          start.character
        )
      : undefined;

  const trailingText = endLine.text.slice(end.character);
  const trailingDelimiters = trailingText.match(/^\s+/);
  const trailingDelimiterRange =
    trailingDelimiters != null
      ? new Range(
          end.line,
          end.character,
          end.line,
          end.character + trailingDelimiters[0].length
        )
      : undefined;

  const includeDelimitersInRemoval =
    (leadingDelimiterRange != null || trailingDelimiterRange != null) &&
    (leadingDelimiterRange != null || start.character === 0) &&
    (trailingDelimiterRange != null || end.isEqual(endLine.range.end));

  return {
    includeDelimitersInRemoval,
    leadingDelimiterRange,
    trailingDelimiterRange,
  };
}
