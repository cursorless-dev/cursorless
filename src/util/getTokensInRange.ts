import Range from "../libs/common/ide/Range";
import { TextEditor } from "../libs/common/ide/types/TextEditor";
import { tokenize } from "../libs/cursorless-engine/tokenizer";
import { RangeOffsets } from "../typings/updateSelections";

export interface PartialToken {
  text: string;
  range: Range;
  offsets: RangeOffsets;
}

export function getTokensInRange(
  editor: TextEditor,
  range: Range,
): PartialToken[] {
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
      text: match[0],
      range,
      offsets: { start: startOffset, end: endOffset },
    };
  });
}
