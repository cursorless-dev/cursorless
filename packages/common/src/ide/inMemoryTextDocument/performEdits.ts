import type { Edit } from "../../types/Edit";
import type { Range } from "../../types/Range";
import type { TextDocument } from "../../types/TextDocument";
import type { TextDocumentContentChangeEvent } from "../types/Events";

/**
 * Apply a series of edits to a document. Note that this function does not
 * modify the document itself, but rather returns a new string with the edits
 * applied.
 *
 * @param document The document to apply the edits to.
 * @param edits The edits to apply.
 * @returns An object containing the new text of the document and the changes
 * that were made.
 */
export function performEdits(document: TextDocument, edits: readonly Edit[]) {
  const changes = createChangeEvents(document, edits);

  let result = document.getText();

  for (const change of changes) {
    const { text, rangeOffset, rangeLength } = change;

    result =
      result.slice(0, rangeOffset) +
      text +
      result.slice(rangeOffset + rangeLength);
  }

  return { text: result, changes };
}

function createChangeEvents(
  document: TextDocument,
  edits: readonly Edit[],
): TextDocumentContentChangeEvent[] {
  const changes: TextDocumentContentChangeEvent[] = [];

  /**
   * Edits sorted in reverse document order so that edits don't interfere with
   * each other.
   */
  const sortedEdits = edits
    .map((edit, index) => ({ edit, index }))
    .sort((a, b) => {
      // Edits starting at the same position are sorted in reverse given order.
      if (a.edit.range.start.isEqual(b.edit.range.start)) {
        return b.index - a.index;
      }
      return b.edit.range.start.compareTo(a.edit.range.start);
    })
    .map(({ edit }) => edit);

  for (const edit of sortedEdits) {
    const previousChange = changes[changes.length - 1];
    const intersection = previousChange?.range.intersection(edit.range);

    if (intersection != null && !intersection.isEmpty) {
      // Overlapping removal ranges are just merged.
      if (!previousChange.text && !edit.text) {
        changes[changes.length - 1] = createChangeEvent(
          document,
          previousChange.range.union(edit.range),
          "",
        );
        continue;
      }

      // Overlapping non-removal ranges are not allowed.
      throw Error("Overlapping ranges are not allowed!");
    }

    changes.push(createChangeEvent(document, edit.range, edit.text));
  }

  return changes;
}

function createChangeEvent(
  document: TextDocument,
  range: Range,
  text: string,
): TextDocumentContentChangeEvent {
  const start = document.offsetAt(range.start);
  const end = document.offsetAt(range.end);
  return {
    text,
    range,
    rangeOffset: start,
    rangeLength: end - start,
  };
}
