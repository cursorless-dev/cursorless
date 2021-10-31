import * as vscode from "vscode";
import { tokenize, TOKEN_MATCHER } from "../core/tokenizer";
import { Token } from "../typings/Types";
import { RangeOffsets } from "../typings/updateSelections";

export interface PartialToken {
  text: string;
  range: vscode.Range;
  offsets: RangeOffsets;
}

export function getTokensInRange(
  editor: vscode.TextEditor,
  range: vscode.Range
): PartialToken[] {
  const text = editor.document.getText(range).toLowerCase();
  const rangeOffset = editor.document.offsetAt(range.start);

  return tokenize(text, (match) => {
    const startOffset = rangeOffset + match.index!;
    const endOffset = rangeOffset + match.index! + match[0].length;
    const range = new vscode.Range(
      editor.document.positionAt(startOffset),
      editor.document.positionAt(endOffset)
    );

    return {
      text: match[0],
      range,
      offsets: { start: startOffset, end: endOffset },
    };
  });
}
