import type { TextEditor, Token } from "@cursorless/common";
import { Range } from "@cursorless/common";
import { tokenize } from "../../tokenizer";

export function getTokensInRange(editor: TextEditor, range: Range): Token[] {
  const languageId = editor.document.languageId;
  const text = editor.document.getText(range);
  const rangeOffset = editor.document.offsetAt(range.start);

  return tokenize(text, languageId, (match) => {
    const startOffset = rangeOffset + match.index!;
    const endOffset = rangeOffset + match.index! + match[0].length;
    const range = new Range(
      editor.document.positionAt(startOffset),
      editor.document.positionAt(endOffset),
    );

    return {
      editor,
      text: match[0],
      range,
      offsets: { start: startOffset, end: endOffset },
    };
  });
}
