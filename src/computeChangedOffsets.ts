import { Range, TextEditor } from "vscode";

interface EditDescription {
  range: Range;
  text: string;
}

interface OffsetRange {
  startOffset: number;
  endOffset: number;
}

export function computeChangedOffsets(
  editor: TextEditor,
  edits: EditDescription[]
) {
  const labeledEdits = edits.map((edit, index) => ({
    startOffset: editor.document.offsetAt(edit.range.start),
    endOffset: editor.document.offsetAt(edit.range.end),
    newTextLength: edit.text.length,
    index,
  }));

  labeledEdits.sort((edit1, edit2) => edit1.startOffset - edit2.startOffset);

  var cumulativeOffset = 0;

  const returnValue: OffsetRange[] = new Array(edits.length);

  labeledEdits.forEach((edit) => {
    const offsetDifference =
      edit.newTextLength - (edit.endOffset - edit.startOffset);

    const newStartOffset = edit.startOffset + cumulativeOffset;
    const newEndOffset = edit.endOffset + cumulativeOffset + offsetDifference;

    cumulativeOffset += offsetDifference;

    returnValue[edit.index] = {
      startOffset: newStartOffset,
      endOffset: newEndOffset,
    };
  });

  return returnValue;
}
