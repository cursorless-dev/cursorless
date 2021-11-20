import { Range, Selection, TextDocument, TextEditor } from "vscode";
import {
  Delimiter,
  DelimiterInclusion
} from "../../../typings/Types";
import { extractSelectionFromDelimiterIndices } from "./extractSelectionFromDelimiterIndices";
import { findSurroundingPairInText } from "./findSurroundingPairInText";


export function findSurroundingPairTextBased(
  editor: TextEditor,
  selection: Selection,
  allowableRange: Range | null,
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  const allowableRangeStartOffset = allowableRange == null ? 0 : document.offsetAt(allowableRange.start);

  const pairIndices = findSurroundingPairInText(
    document.getText(allowableRange ?? undefined),
    document.offsetAt(selection.start) - allowableRangeStartOffset,

    document.offsetAt(selection.end) - allowableRangeStartOffset,
    delimiter
  );
  if (pairIndices == null) {
    return null;
  }

  return extractSelectionFromDelimiterIndices(
    document,
    allowableRangeStartOffset,
    pairIndices,
    delimiterInclusion
  ).map(({ selection, context }) => ({
    selection: { selection, editor },
    context,
  }));
}
