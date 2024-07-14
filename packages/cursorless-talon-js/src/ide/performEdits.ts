import { Edit, type TextDocumentContentChangeEvent } from "@cursorless/common";
import { actions } from "talon";
import type { TalonJsEditor } from "./TalonJsEditor";
import type { TalonJsIDE } from "./TalonJsIDE";

export async function performEdits(
  ide: TalonJsIDE,
  editor: TalonJsEditor,
  edits: Edit[],
): Promise<boolean> {
  edits.sort((a, b) => b.range.start.compareTo(a.range.start));

  print("Edits sorted");

  for (const edit of edits) {
    print(
      `\trange=${edit.range.toString()}, text='${edit.text}', isReplace=${!!edit.isReplace}`,
    );
  }

  const { document } = editor;
  const changes: TextDocumentContentChangeEvent[] = [];

  for (const edit of edits) {
    const start = document.offsetAt(edit.range.start);
    const end = document.offsetAt(edit.range.end);
    changes.push({
      range: edit.range,
      rangeOffset: start,
      rangeLength: end - start,
      text: edit.text,
    });
  }

  let result = document.getText();

  for (const change of changes) {
    const { rangeOffset, rangeLength, text } = change;

    result =
      result.slice(0, rangeOffset) +
      text +
      result.slice(rangeOffset + rangeLength);
  }

  print(result);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });

  document.setTextInternal(result);

  //   editor.updateInternal({ text: result, selection: editor.selections[0] });

  actions.user.cursorless_js_set_text(result);

  return true;
}
