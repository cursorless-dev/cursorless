import * as vscode from "vscode";
import { Token } from "./Types";
import { TOKEN_MATCHER } from "./extension";

export function getTokensInRange(
  editor: vscode.TextEditor,
  range: vscode.Range,
  displayLineMap: Map<number, number>): Token[] {
  const text = editor.document.getText(range).toLowerCase();
  const rangeOffset = editor.document.offsetAt(range.start);

  return Array.from(text.matchAll(TOKEN_MATCHER), (match) => {
    const range = new vscode.Range(
      editor.document.positionAt(rangeOffset + match.index!),
      editor.document.positionAt(rangeOffset + match.index! + match[0].length)
    );
    return {
      text: match[0],
      range,
      displayLine: displayLineMap.get(range.start.line)!,
    };
  });
}
