import * as vscode from "vscode";

export default class EditStyles {
  pendingDelete: vscode.TextEditorDecorationType;
  pendingLineDelete: vscode.TextEditorDecorationType;
  referenced: vscode.TextEditorDecorationType;
  referencedLine: vscode.TextEditorDecorationType;
  pendingModification0: vscode.TextEditorDecorationType;
  pendingLineModification0: vscode.TextEditorDecorationType;
  pendingModification1: vscode.TextEditorDecorationType;
  pendingLineModification1: vscode.TextEditorDecorationType;
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

    this.pendingModification0 = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor(
        "cursorless.pendingModification0Background"
      ),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    this.pendingLineModification0 = vscode.window.createTextEditorDecorationType(
      {
        backgroundColor: new vscode.ThemeColor(
          "cursorless.pendingModification0Background"
        ),
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        isWholeLine: true,
      }
    );

    this.pendingModification1 = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor(
        "cursorless.pendingModification1Background"
      ),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    this.pendingLineModification1 = vscode.window.createTextEditorDecorationType(
      {
        backgroundColor: new vscode.ThemeColor(
          "cursorless.pendingModification1Background"
        ),
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        isWholeLine: true,
      }
    );
  }
}
