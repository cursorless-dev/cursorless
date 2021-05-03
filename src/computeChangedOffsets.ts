import { TextEditor } from "vscode";
import { TypedSelection } from "./Types";
import { flatten } from "lodash";

interface EditDescription {
  startOffset: number;
  endOffset: number;
  newTextLength: number;
}

interface OffsetRange {
  startOffset: number;
  endOffset: number;
}

export function computeChangedOffsets(edits: EditDescription[]) {
  const labeledEdits = edits.map((edit, index) => ({
    ...edit,
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
