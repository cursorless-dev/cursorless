import * as vscode from "vscode";

export default class EditStyles {
  pendingDelete: vscode.TextEditorDecorationType;
  pendingLineDelete: vscode.TextEditorDecorationType;

  constructor() {
    this.pendingDelete = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor(
        "cursorless.pendingDeleteBackground"
      ),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
    this.pendingLineDelete = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor(
        "cursorless.pendingDeleteBackground"
      ),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      isWholeLine: true,
    });
  }
}
