import { Range, TextDocument } from "vscode";

/**
 * Get a range that corresponds to the entire contents of the given document.
 *
 * @param document The document to consider
 * @returns A range corresponding to the entire document contents
 */
export function getDocumentRange(document: TextDocument) {
  const firstLine = document.lineAt(0);
  const lastLine = document.lineAt(document.lineCount - 1);

  return new Range(firstLine.range.start, lastLine.range.end);
}
