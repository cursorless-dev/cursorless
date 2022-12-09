import * as vscode from "vscode";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Graph } from "../typings/Types";

const DEFAULT_TEXT = "$(cursorless-icon) Cursorless";

export default class StatusBarItem {
  private disposables: vscode.Disposable[] = [];
  private statusBarItem?: vscode.StatusBarItem;

  constructor(private graph: Graph) {
    ide().disposeOnExit(this);
  }

  init() {
    const commandId = "cursorless.showQuickPick";
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = commandId;
    this.statusBarItem.text = DEFAULT_TEXT;
    this.statusBarItem.show();

    this.disposables.push(
      vscode.commands.registerCommand("cursorless.showDocumentation", () =>
        vscode.env.openExternal(
          vscode.Uri.parse("https://www.cursorless.org/docs/"),
        ),
      ),
      vscode.commands.registerCommand(commandId, this.showQuickOpen),
      this.statusBarItem,
    );
  }

  setText(text: string) {
    this.statusBarItem!.text = `$(cursorless-icon) ${text}`;
  }

  unsetText() {
    this.statusBarItem!.text = DEFAULT_TEXT;
  }

  private showQuickOpen = () =>
    vscode.commands.executeCommand("workbench.action.quickOpen", ">Cursorless");

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
