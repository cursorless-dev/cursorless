import * as vscode from "vscode";

const DEFAULT_TEXT = "$(cursorless-icon) Cursorless";

export class StatusBarItem {
  private statusBarItem?: vscode.StatusBarItem;

  private constructor() {
    // empty
  }

  static create(showQuickPickCommandId: string) {
    const statusBarItem = new StatusBarItem();
    statusBarItem.init(showQuickPickCommandId);
    return statusBarItem;
  }

  private init(showQuickPickCommandId: string) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = showQuickPickCommandId;
    this.statusBarItem.text = DEFAULT_TEXT;
    this.statusBarItem.show();
  }

  setText(text: string) {
    this.statusBarItem!.text = `$(cursorless-icon) ${text}`;
  }

  unsetText() {
    this.statusBarItem!.text = DEFAULT_TEXT;
  }
}
