import * as vscode from "vscode";

export default class EditStyles {
  pendingDelete: vscode.TextEditorDecorationType;
  pendingLineDelete: vscode.TextEditorDecorationType;
  referenced: vscode.TextEditorDecorationType;
  referencedLine: vscode.TextEditorDecorationType;
  justAdded: vscode.TextEditorDecorationType;

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

    this.justAdded = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor("cursorless.justAddedBackground"),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    this.referenced = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor("cursorless.referencedBackground"),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    this.referencedLine = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor("cursorless.referencedBackground"),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      isWholeLine: true,
    });
  }
}
