import {
  Edit,
  type Range,
  type TextDocument,
  type TextDocumentContentChangeEvent,
} from "@cursorless/common";
import type { InMemoryTextDocument } from "./InMemoryTextDocument";

export async function performEdits(
  document: InMemoryTextDocument,
  edits: readonly Edit[],
) {
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

  const sortedEdits = [...edits].sort((a, b) =>
    b.range.start.compareTo(a.range.start),
  );

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
