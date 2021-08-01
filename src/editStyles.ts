import * as vscode from "vscode";

export class EditStyle {
  token: vscode.TextEditorDecorationType;
  line: vscode.TextEditorDecorationType;

  constructor(colorName: string) {
    const options = {
      backgroundColor: new vscode.ThemeColor(`cursorless.${colorName}`),
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    };
    this.token = vscode.window.createTextEditorDecorationType(options);
    this.line = vscode.window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }
}

export class EditStyles {
  pendingDelete: EditStyle;
  referenced: EditStyle;
  pendingModification0: EditStyle;
  pendingModification1: EditStyle;
  justAdded: EditStyle;

  constructor() {
    this.pendingDelete = new EditStyle("pendingDeleteBackground");
    this.justAdded = new EditStyle("justAddedBackground");
    this.referenced = new EditStyle("referencedBackground");
    this.pendingModification0 = new EditStyle("pendingModification0Background");
    this.pendingModification1 = new EditStyle("pendingModification1Background");
  }
}
