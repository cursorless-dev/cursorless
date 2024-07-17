import {
  Edit,
  type Range,
  type TextDocument,
  type TextDocumentContentChangeEvent,
} from "@cursorless/common";
import { actions } from "talon";
import type { TalonJsEditor } from "./TalonJsEditor";
import type { TalonJsIDE } from "./TalonJsIDE";

export async function performEdits(
  ide: TalonJsIDE,
  editor: TalonJsEditor,
  edits: Edit[],
): Promise<boolean> {
  edits.sort((a, b) => b.range.start.compareTo(a.range.start));

  //   print("Edits sorted");
  //   for (const edit of edits) {
  //     print(
  //       `\trange=${edit.range.toString()}, text='${edit.text}', isReplace=${!!edit.isReplace}`,
  //     );
  //   }

  const { document } = editor;
  const changes: TextDocumentContentChangeEvent[] = [];

  for (const edit of edits) {
    const previousChange = changes[changes.length - 1];
    const intersection = previousChange?.range.intersection(edit.range);

    // Overlapping removal ranges are just merged.
    if (intersection != null && !intersection.isEmpty) {
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

  //   print("Changes");
  //   for (const change of changes) {
  //     print(`\trange=${change.range.toString()}, text='${change.text}'`);
  //   }

  let result = document.getText();

  for (const change of changes) {
    const { rangeOffset, rangeLength, text } = change;

    result =
      result.slice(0, rangeOffset) +
      text +
      result.slice(rangeOffset + rangeLength);
  }

  actions.user.cursorless_everywhere_set_text(result);
  document.setTextInternal(result);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });

  return true;
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
