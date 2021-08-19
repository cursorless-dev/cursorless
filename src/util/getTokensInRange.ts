import * as vscode from "vscode";
import { tokenize } from "../core/tokenizer";
import { Token } from "../typings/Types";

export function getTokensInRange(
  editor: vscode.TextEditor,
  range: vscode.Range,
  displayLineMap: Map<number, number>
): Token[] {
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
      startOffset,
      endOffset,
      displayLine: displayLineMap.get(range.start.line)!,
      editor,
    };
  });
}
